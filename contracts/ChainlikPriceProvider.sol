pragma solidity ^0.6.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAssetsPriceProvider.sol";
import "./IAggregatorInterface.sol";
import "./IERC20Details.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IBalancerPool.sol";


/************
@title ChainlinkPriceProvider
@notice An assets price provider linked to chainlink oracle protocol
*/

contract ChainlinkPriceProvider is IAssetsPriceProvider, Ownable {
  using SafeMath for uint;

  address constant ETH_ORACLE = 0x9326BFA02ADD2366b30bacB125260Af641031331;
  address constant WETH = 0xd0A1E359811322d97991E03f863a0C30C2cF029C;

  mapping(address => AggregatorInterface) aggregators;

  function setChainlinkAggregator(address _asset, AggregatorInterface _aggregator) onlyOwner external {
    aggregators[_asset] = _aggregator;
  }

  /**
  * @dev Provides current price of an asset denominated in USD
  * @param _asset the address of an asset(token) contract
  **/
  function getAssetPrice(address _asset) override external view returns(uint256) {
    if (_asset == WETH) {
      return this.getEthPrice();
    }

    AggregatorInterface aggregator = aggregators[_asset];
    require(address(aggregator) != address(0x0), 'There is no aggregator for a given asset');
    int256 price = aggregator.latestAnswer();
    require(price > 0, 'Invalid price from chainlink aggregator (negative value)');
    uint256 priceUsd = this.getEthPrice().mul(uint256(price)).div(10 ** 18);
    return priceUsd;
  }

  /**
  * @dev Calculates the value of Balancer Pool Tokens based on assets price
  * @param _bpt the address of balance pool token
  * @param _amount the amount of tokens
  **/
  function getBPTValue(address _bpt, uint256 _amount) override external view returns(uint256) {
    IBalancerPool pool = IBalancerPool(_bpt);
    IERC20 bToken = IERC20(_bpt);
    uint256 totalSupply = bToken.totalSupply();

    address[] memory tokens = pool.getCurrentTokens();
    uint256 val = 0;
    for(uint8 i=0; i < tokens.length; i++) {
      IERC20 token = IERC20(tokens[i]);
      uint256 balance = token.balanceOf(_bpt);
      uint256 tokenAmount = _amount.mul(balance).div(totalSupply);
      val = val.add(this.getAssetValue(tokens[i], tokenAmount));
    }
    return val;
  }

  /**
   * @dev Gets precision of prices returned by the provider
  **/
  function getAssetValue(address _asset, uint256 _amount) override external view returns(uint256) {
    IERC20Details token = IERC20Details(_asset);
    return this.getAssetPrice(_asset).mul(_amount).div(10 ** token.decimals());
  }

  /**
    * @dev Provides current price of Ether denominated in USD
    **/
  function getEthPrice() override external view returns(uint256) {
    AggregatorInterface aggregator = AggregatorInterface(ETH_ORACLE);
    int256 price = aggregator.latestAnswer();
    require(price > 0, 'Invalid ETH price from chainlink aggregator (negative value)');
    return uint256(price).mul(10 ** 10);
  }

}
