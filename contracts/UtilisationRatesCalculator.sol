pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRatesCalculator.sol";
import "./WadRayMath.sol";


/**
 * @title UtilisationRatesCalculator
 * @dev Contract which calculates the interest rates based on pool utilisation.
 * Utilisation is computed as the ratio between funds borrowed and funds deposited to the pool.
 * Rates are calculated using a linear function with slope defined by _utilisation factor and
 * shifted by an offset parameter.
 */
contract UtilisationRatesCalculator is IRatesCalculator, Ownable {
    using SafeMath for uint256;
    using WadRayMath for uint256;

    uint256 utilisationFactor;
    uint256 offset;

    constructor(uint256 _utilisationFactor, uint256 _offset) public {
        setParameters(_utilisationFactor, _offset);
    }

    /***
     *
     * Compound, which is one of the top defi players uses 0.05 as offset and 0.15 as utilisation factor
    */
    function setParameters(uint256 _utilisationFactor, uint256 _offset) public onlyOwner {
        require(_utilisationFactor <= 1 ether, "Calculator factor must be lower than 1");
        require(_offset <= 1 ether, "Calculator offset must be lower than 1");

        utilisationFactor = _utilisationFactor;
        offset = _offset;
    }

    function getPoolUtilisation(uint256 totalLoans, uint256 totalDeposits) public pure returns(uint256) {
        if (totalDeposits == 0) return 0;

        return totalLoans.wadToRay()
               .rayDiv(totalDeposits.wadToRay())
               .rayToWad();
    }

    function calculateDepositRate(uint256 totalLoans, uint256 totalDeposits) external view override returns(uint256) {
        if (totalDeposits == 0) return 0;

        return this.calculateBorrowingRate(totalLoans, totalDeposits).wadToRay()
            .rayMul(totalLoans.wadToRay())
            .rayDiv(totalDeposits.wadToRay())
            .rayToWad();
    }

    function calculateBorrowingRate(uint256 totalLoans, uint256 totalDeposits) external view override returns(uint256) {
        return getPoolUtilisation(totalLoans, totalDeposits).wadToRay()
                .rayMul(utilisationFactor.wadToRay()).rayToWad()
                .add(offset);
    }

}
