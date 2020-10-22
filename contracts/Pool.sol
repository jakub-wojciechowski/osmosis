pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./CompoundingIndex.sol";
import "./IRatesCalculator.sol";

/**
 * @title Pool
 * @dev Contract allowing user to deposit and borrow funds from a single pot
 * Depositors are rewarded with interest rates collected from borrowers.
 * Rates are compounded every second and getters always return the current deposit and borrowing balance.
 * The interest rates calculation is delegated to an external calculator contracts.
 */
contract Pool {
    using SafeMath for uint256;

    mapping(address => uint256) public deposits;
    uint256 public totalDeposited;

    mapping(address => uint256) public borrowed;
    uint256 public totalBorrowed;

    IRatesCalculator ratesCalculator;

    CompoundingIndex depositIndex = new CompoundingIndex();
    CompoundingIndex borrowIndex = new CompoundingIndex();

    event Deposit(address indexed user, uint256 value, uint256 time);
    event Withdrawal(address indexed user, uint256 value, uint256 time);
    event Borrowing(address indexed user, uint256 value, uint256 time);
    event Repayment(address indexed user, uint256 value, uint256 time);

    function setRatesCalculator(IRatesCalculator _ratesCalculator) public {
        ratesCalculator = _ratesCalculator;
        updateRates();
    }

    function updateRates() public {
        depositIndex.setRate(ratesCalculator.calculateDepositRate(totalBorrowed, totalDeposited));
        borrowIndex.setRate(ratesCalculator.calculateBorrowingRate(totalBorrowed, totalDeposited));
    }

    function getDepositRate() public view returns(uint256) {
        return ratesCalculator.calculateDepositRate(totalBorrowed, totalDeposited);
    }

    function getBorrowingRate() public view returns(uint256) {
        return ratesCalculator.calculateBorrowingRate(totalBorrowed, totalDeposited);
    }

    function deposit() payable external {
        accumulateDepositInterests(msg.sender);

        deposits[msg.sender] = deposits[msg.sender].add(msg.value);
        totalDeposited = totalDeposited.add(msg.value);

        updateRates();

        emit Deposit(msg.sender, msg.value, now);
    }

    function withdraw(uint256 amount) external {
        accumulateDepositInterests(msg.sender);

        require(deposits[msg.sender] >= amount, "You are trying to withdraw more that was deposited.");

        deposits[msg.sender] = deposits[msg.sender].sub(amount);
        totalDeposited = totalDeposited.sub(amount);

        msg.sender.transfer(amount);

        updateRates();

        emit Withdrawal(msg.sender, amount, now);
    }

    function getDeposits(address user) public view returns(uint256) {
        return depositIndex.getIndexedValue(deposits[user], user);
    }

    function borrow(uint256 amount) payable external {
        require(address(this).balance >= amount, "There is no enough funds in the pool to fund the loan.");
        //require(borrowingAuthoriser.canBorrow(msg.sender, amount), "The borrower is not authorised.");

        borrowed[msg.sender] = borrowed[msg.sender].add(amount);
        totalBorrowed = totalBorrowed.add(amount);

        msg.sender.transfer(amount);

        updateRates();

        emit Borrowing(msg.sender, amount, now);
    }

    function repay() payable external {
        accumulateBorrowingInterests(msg.sender);

        require(getBorrowed(msg.sender) >= msg.value, "You are trying to repay more that was borrowed.");

        borrowed[msg.sender] = borrowed[msg.sender].sub(msg.value);
        totalBorrowed = totalBorrowed.sub(msg.value);

        updateRates();

        emit Repayment(msg.sender, msg.value, now);
    }


    function getBorrowed(address user) public view returns(uint256) {
        return borrowIndex.getIndexedValue(borrowed[user], user);
    }


    function accumulateDepositInterests(address user) internal {
        uint256 depositedWithInterests = getDeposits(user);
        uint256 interests = depositedWithInterests.sub(deposits[user]);
        deposits[user] = depositedWithInterests;
        totalDeposited = totalDeposited.add(interests);
        depositIndex.updateUser(user);
    }


    function accumulateBorrowingInterests(address user) internal {
        uint256 borrowedWithInterests = getBorrowed(user);
        uint256 interests = borrowedWithInterests.sub(borrowed[user]);
        borrowed[user] = borrowedWithInterests;
        totalBorrowed = totalBorrowed.add(interests);
        borrowIndex.updateUser(user);
    }

}
