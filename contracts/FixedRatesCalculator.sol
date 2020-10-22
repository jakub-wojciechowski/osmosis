pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRatesCalculator.sol";

/**
 * @title UtilisationRatesCalculator
 * @dev Contract which calculates the interest rates based on pool utilisation.
 * Utilisation is computed as the ratio between funds borrowed and funds deposited to the pool.
 * Rates are calculated using a linear function with slope defined by _utilisation factor and
 * shifted by an offset parameter.
 */
contract FixedRatesCalculator is IRatesCalculator, Ownable {

    uint256 depositRate;
    uint256 borrowingRate;

    constructor(uint256 _depositRate, uint256 _borrowingRate) public {
        setRates(_depositRate, _borrowingRate);
    }

    function setRates(uint256 _depositRate, uint256 _borrowingRate) public onlyOwner {
        require(_depositRate <= _borrowingRate, "Borrowing rate cannot be lower than the deposit rate");

        depositRate = _depositRate;
        borrowingRate = _borrowingRate;
    }

    function calculateDepositRate(uint256 totalLoans, uint256 totalDeposits) external view override returns(uint256) {
        return depositRate;
    }

    function calculateBorrowingRate(uint256 totalLoans, uint256 totalDeposits) external view override returns(uint256) {
        return borrowingRate;
    }

}
