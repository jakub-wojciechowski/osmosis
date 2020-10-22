pragma solidity ^0.6.0;

/**
 * @title IRatesCalculator
 * @dev Interface defining base method for contracts implementing interest rates calculation.
 * The final value may be based on the relation between funds borrowed and deposited.
 */
interface IRatesCalculator {

    function calculateBorrowingRate(uint256 totalLoans, uint256 totalDeposits) external view returns(uint256);

    function calculateDepositRate(uint256 totalLoans, uint256 totalDeposits) external view returns(uint256);

}
