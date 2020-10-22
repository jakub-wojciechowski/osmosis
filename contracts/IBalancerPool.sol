pragma solidity ^0.6.1;


/************
@title IBalancerPool interface
@notice A limited api of Balancer Pool
*/
interface IBalancerPool {

  function getCurrentTokens() external view returns (address[] memory tokens);


  function joinPool(uint poolAmountOut, uint[] calldata maxAmountsIn) external;
}
