interface IVaultProxy {

  function increaseLimit(address vault, address spender, uint addedValue) external;

  function deposit(address vault, address aToken, uint amount) external;

  function withdraw(address vault, address aToken, uint amount) external;

  function borrow(address vault, address reserve, uint amount) external;

  function repay(address vault, address reserve, uint amount) external;

  function deployVault(address _asset) external returns (address);
}
