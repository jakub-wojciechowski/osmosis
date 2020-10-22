pragma solidity ^0.6.1;


/************
@title IAssetsPriceProvider interface
@notice An interface that specifies function used to query current assets price
*/

interface IAssetsPriceProvider {

  /**
  * @dev Provides current price of an asset denominated in USD
  * @param _asset the address of an asset(token) contract
  **/
  function getAssetPrice(address _asset) external view returns(uint256);

  /**
  * @dev Gets value of a given amount of asset expressed in ETH
  **/
  function getAssetValue(address _asset, uint256 _amount) external view returns(uint256);

  /**
  * @dev Provides current price of Ether denominated in USD
  **/
  function getEthPrice() external view returns(uint256);

  function getBPTValue(address _bpt, uint256 _amount) external view returns(uint256);

}
