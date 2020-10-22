pragma solidity ^0.6.1;


/************
@title IWeth interface
@notice An interface to integrate with wrapped ETH
*/

interface IWeth {

  function deposit() external payable;

  function withdraw(uint wad) external;

}
