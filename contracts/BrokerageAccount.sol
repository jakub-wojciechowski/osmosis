pragma solidity ^0.6.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreditManager.sol";
import "./IAssetsPriceProvider.sol";
import "./IWeth.sol";
import "./IBalancerPool.sol";
import "./ISavingsContract.sol";
import "./IMetaToken.sol";

/**
 * @title BrokerageAccount
 * A contract that is authorised to borrow funds using delegated credit.
 * It maintains solvency calculating the current value of assets and borrowings.
 * In case the value of assets held drops below certain level, part of the funds may be forcibly repaid.
 * It permits only a limited and safe token transfer.
 *
 */
contract BrokerageAccount is Ownable {
  using SafeMath for uint;

  address public USDT = 0x13512979ADE267AB5100878E2e0f485B568328a4;
  address public WETH = 0xd0A1E359811322d97991E03f863a0C30C2cF029C;
  address public M_USD = 0x70605Bdd16e52c86FC7031446D995Cf5c7E1b0e7;
  address public BPT_USDT_ETH = 0x645BAe5677852a05cE2496159280af63Bce6A7D6;
  address public M_SAVINGS = 0x54Ac0bdf4292F7565Af13C9FBEf214eEEB2d0F87;

  address[4] public ASSETS = [USDT, WETH, M_USD, BPT_USDT_ETH];


  uint256 private constant SOLVENCY_PRECISION = 1000;
  uint256 private constant MAX_SOLVENCY_RATIO = 10000;

  uint256 private constant LIQUIDATION_BONUS = 10;
  uint256 private constant LIQUIDATION_CAP = 200;

  CreditManager public creditManager;
  IAssetsPriceProvider public priceProvider;

  uint256 public minSolvencyRatio;

  constructor(
    uint256 _minSolvencyRatio,
    IAssetsPriceProvider _priceProvider,
    CreditManager _creditManager,
    address _creator
  ) public {
    priceProvider = _priceProvider;
    minSolvencyRatio = _minSolvencyRatio;
    creditManager = _creditManager;
    transferOwnership(_creator);
  }

  function fund(address _asset, uint256 _amount) external payable{
    if (_asset != address(0x0)) {
      IERC20(_asset).transferFrom(msg.sender, address(this), _amount);
    }

    emit Funded(msg.sender, _asset, _amount, now);
  }

  function withdraw(address _asset, uint256 _amount) external remainsSolvent payable onlyOwner {
    require(this.getAssetBalance(address(_asset)) >= _amount, "There is not enough of a given asset in the account");

    require(IERC20(_asset).transfer(msg.sender, _amount));

    emit Withdrawn(msg.sender, _asset, _amount, now);
  }


  function borrow(address _asset, uint256 _amount) external onlyOwner {
    creditManager.borrow(_asset, _amount);

    emit Borrowed(msg.sender, _asset, _amount, now);
  }


  function repay(IERC20 _asset, uint256 _amount) public {
    if (isSolvent()) {
      require(msg.sender == owner());
    }
    require(this.getAssetBalance(address(_asset)) >= _amount, "There is not enough of a given asset in the account");

    _asset.approve(address(creditManager), _amount);
    creditManager.repay(address(_asset), _amount);

    emit Repaid(msg.sender, address(_asset), _amount, now);
  }

  function investIntoBalancer(address _pool, uint256 _amount, address[] memory _assets, uint256[] memory _values) external onlyOwner {
    //Approvals
    for(uint8 i=0; i < _assets.length; i++) {
      IERC20(_assets[i]).approve(_pool, _values[i]);
      if (_assets[i] == WETH) {
        IWeth(WETH).deposit{value: _values[i]}();
      }
    }

    //Investment
    IBalancerPool(_pool).joinPool(_amount, _values);

    uint256 remainingWeth = IERC20(WETH).balanceOf(address(this));

    //Refund of unused funds
    if (remainingWeth > 0) {
      IWeth(WETH).withdraw(remainingWeth);
    }
  }


  function investIntoMetaSavings(address _asset, uint256 _amount) external {
    IERC20(_asset).approve(M_USD, _amount);
    IMetaToken(M_USD).mint(_asset, _amount);

    IERC20(M_USD).approve(M_SAVINGS, _amount);
    ISavingsContract(M_SAVINGS).depositSavings(_amount);
  }


  function liquidate(IERC20 _asset, uint256 _amount) public remainsSolvent {
    require(!isSolvent(), "Cannot liquidate a solvent account");
    repay(_asset, _amount);

    //Liquidator reward
    uint256 bonus = _amount.mul(LIQUIDATION_BONUS).div(100);
    require(_asset.transfer(msg.sender, bonus));

    require(getSolvencyRatio() <= minSolvencyRatio.add(LIQUIDATION_CAP));
  }


  function getSolvencyRatio() public view returns(uint256) {
    uint256 debt = getMyDebt();
    if (debt == 0) {
      return MAX_SOLVENCY_RATIO;
    } else {
      return getAccountValue().mul(SOLVENCY_PRECISION).div(debt);
    }
  }


  function isSolvent() public view returns(bool) {
    return getSolvencyRatio() >= minSolvencyRatio;
  }


  function getMyDebt() public view returns(uint256) {
    uint256 borrowedUsdt = creditManager.getBorrowed(address(this));
    return priceProvider.getAssetValue(USDT, borrowedUsdt);
  }


  function getAccountValue() public view returns(uint256) {
    uint256 total = address(this).balance.mul(priceProvider.getEthPrice()).div(10 ** 18);
    for(uint i = 0; i< ASSETS.length; i++) {
      total = total.add(getAssetValue(ASSETS[i]));
    }
    return total;
  }


  function getAssetBalance(address _asset) public view returns(uint256) {
    if (_asset == M_SAVINGS) {
      ISavingsContract savings = ISavingsContract(M_SAVINGS);
      return savings.creditBalances(address(this));
    } else {
      return IERC20(_asset).balanceOf(address(this));
    }
  }


  function getAllAssetsBalances() public view returns(uint256[] memory) {
    uint256[] memory results = new uint256[] (ASSETS.length);
    for(uint i = 0; i< ASSETS.length; i++) {
      results[i] = getAssetBalance(ASSETS[i]);
    }
    return results;
  }


  function getAssetPrice(address _asset) public view returns(uint256) {
    return priceProvider.getAssetPrice(_asset);
  }


  function getAllAssetsPrices() public view returns(uint256[] memory) {
    uint256[] memory results = new uint256[] (ASSETS.length);
    for(uint i = 0; i< ASSETS.length; i++) {
      results[i] = getAssetPrice(ASSETS[i]);
    }
    return results;
  }


  function getAssetValue(address _asset) public view returns(uint256) {
    if (_asset == BPT_USDT_ETH) {
      return priceProvider.getBPTValue(BPT_USDT_ETH, getAssetBalance(BPT_USDT_ETH));
    } else if (_asset == M_SAVINGS) {
      ISavingsContract savings = ISavingsContract(M_SAVINGS);
      return savings.creditBalances(address(this)).mul(savings.exchangeRate()).div(10 ** 6);
    } else {
      return priceProvider.getAssetValue(_asset, getAssetBalance(_asset));
    }
  }

  receive() external payable { }

  /* ========== Events ========== */
  event Borrowed(address indexed borrower, address indexed asset, uint amount, uint time);

  event Repaid(address indexed borrower, address indexed asset, uint amount, uint time);

  event Funded(address indexed funder, address indexed asset, uint amount, uint time);

  event Withdrawn(address indexed funder, address indexed asset, uint amount, uint time);

  event Traded(address indexed trader, bytes32 assetToSell, uint amount, bytes32 assetToBuy, uint time);


  // ========== MODIFIERS ==========

  modifier remainsSolvent() {
    _;
    require(isSolvent(), "The action may cause an account to become insolvent.");
  }


}
