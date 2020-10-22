pragma solidity ^0.6.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AaveCollateralVaultProxy.sol";
import "./BrokerageAccount.sol";
import "./IAssetsPriceProvider.sol";
import "./IRatesCalculator.sol";


/**
 * @title CreditManager
 * It is a pool to which aToken holders can delegate their credit.
 * It allows authorised smart-contracts to borrow using the delegated credit line.
 *
 */
contract CreditManager is Ownable {
  using SafeMath for uint;

  mapping(address => AaveCollateralVault) public vaults;

  mapping(address => uint256) deposited;
  uint256 public totalDeposited;

  mapping(address => uint256) borrowed;
  uint256 public totalBorrowed;

  mapping(address => bool) public accounts;
  mapping(address => address) public owners;


  AaveCollateralVaultProxy public vaultProxy;
  IAssetsPriceProvider public priceProvider;
  IRatesCalculator public ratesCalculator;

  constructor(
    AaveCollateralVaultProxy  _vaultProxy,
    IAssetsPriceProvider _priceProvider,
    IRatesCalculator _ratesCalculator
  ) public {
    vaultProxy = _vaultProxy;
    priceProvider = _priceProvider;
    ratesCalculator = _ratesCalculator;

    //Add USDT vault
    address usdt = 0x13512979ADE267AB5100878E2e0f485B568328a4;
    address vault = vaultProxy.deployVault(usdt);
    vaults[usdt] = AaveCollateralVault(vault);
    vaultProxy.increaseLimit(vault, address(this), uint256(-1));

    emit VaultAdded(usdt, vault);
  }


  function createAccount() public payable returns(address) {
    BrokerageAccount account = new BrokerageAccount(1200, priceProvider, this, msg.sender);
    accounts[address(account)] = true;
    owners[msg.sender] = address(account);
    address(account).send(msg.value);

    emit AccountCreated(address(account));
    return address(account);
  }


  function deposit(address _borrowingAsset, IERC20 _collateralAsset, uint256 amount) external {

    _collateralAsset.transferFrom(msg.sender, address(this), amount);
    _collateralAsset.approve(address(vaultProxy), amount);

    deposited[msg.sender] = deposited[msg.sender].add(amount);
    totalDeposited = totalDeposited.add(amount);

    vaultProxy.deposit(vaults[_borrowingAsset], address(_collateralAsset), amount);

    emit Deposited(msg.sender, address(_collateralAsset), amount, now);
  }


  function withdraw(address _borrowingAsset, IERC20 _collateralAsset, uint256 amount) external {

    deposited[msg.sender] = deposited[msg.sender].sub(amount);
    totalDeposited = totalDeposited.sub(amount);

    vaultProxy.withdraw(vaults[_borrowingAsset], address(_collateralAsset), amount);
    _collateralAsset.transfer(msg.sender, amount);

  }

  function borrow(address _asset, uint256 amount) brokerageAccountOnly external {

    vaultProxy.borrow(vaults[_asset], _asset, amount);

    borrowed[msg.sender] = borrowed[msg.sender].add(amount);
    totalBorrowed = totalBorrowed.add(amount);

    IERC20(_asset).transfer(msg.sender, amount);
  }


  function repay(address _asset, uint256 _amount) brokerageAccountOnly external {

    IERC20(_asset).transferFrom(msg.sender, address(this), _amount);
    IERC20(_asset).approve(address(vaultProxy), _amount);
    vaultProxy.repay(vaults[_asset], _asset, _amount);

    borrowed[msg.sender] = borrowed[msg.sender].sub(_amount);
    totalBorrowed = totalBorrowed.sub(_amount);
  }

  /* ========== Getters ========== */

  function getBorrowed(address _account) public view returns(uint256) {
    return borrowed[_account];
  }

  function getDeposited(address _account) public view returns(uint256) {
    return deposited[_account];
  }

  function getAccountForOwner(address _owner) public view returns(address) {
    return owners[_owner];
  }

  function getDelegationRate() public view returns(uint256) {
    return ratesCalculator.calculateDepositRate(totalBorrowed, totalDeposited);
  }


  /* ========== Events ========== */
  event VaultAdded(address indexed asset, address vault);

  event Deposited(address indexed delegator, address indexed collateralAsset, uint amount, uint time);

  event AccountCreated(address indexed accountAddress);

  // ========== MODIFIERS ==========

  modifier brokerageAccountOnly() {
    require(accounts[msg.sender], "Only a compatible brokerage account can borrow");
    _;
  }

}
