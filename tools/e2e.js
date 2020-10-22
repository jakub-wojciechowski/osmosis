const fs = require('fs');
const ethers = require('ethers');
const utils = ethers.utils;
const AAVE_LENDING_POOL = require('./abi/LendingPool.json');
const A_TOKEN = require('../src/blockchain/abi/AToken.json');
const ACVP = require('../build/contracts/AaveCollateralVaultProxy.json');
const MANAGER = require('../build/contracts/CreditManager.json');
const ORACLE = require('../build/contracts/ChainlinkPriceProvider.json');
const M_ASSET = require('./abi/Masset.json');
const BA = require('../build/contracts/BrokerageAccount.json');
const VAULT = require('../build/contracts/AaveCollateralVault.json');
const BAL_POOL = require('./abi/Bal.json');
const M_SAVINGS = require('../build/contracts/ISavingsContract.json')



const ETHER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
const USDT = "0x13512979ade267ab5100878e2e0f485b568328a4";
const WETH = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
const BAL  = "0x645bae5677852a05ce2496159280af63bce6a7d6";
const ZERO = "0x0000000000000000000000000000000000000000";
const M_USD = "0x70605Bdd16e52c86FC7031446D995Cf5c7E1b0e7";

const AAVE_PROXY = "0x3b640c248e488f2d25f481828312f60ce7075f30";


const mnemonic = fs.readFileSync("../.secret").toString().trim();

let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
let provider = ethers.getDefaultProvider('kovan');
let wallet = mnemonicWallet.connect(provider);

let path = "m/44'/60'/1'/0/0";
let borrowerMnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);
let borrowerWallet = borrowerMnemonicWallet.connect(provider);


let aavePool = new ethers.Contract("0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c", AAVE_LENDING_POOL, wallet);
let aEth = new ethers.Contract("0xD483B49F2d55D2c53D32bE6efF735cB001880F79", A_TOKEN, wallet);
let aUsdt = new ethers.Contract("0xA01bA9fB493b851F4Ac5093A324CB081A909C34B", A_TOKEN, wallet);
let aUsdc = new ethers.Contract("0x02f626c6ccb6d2ebc071c068dc1f02bf5693416a", A_TOKEN, wallet);
let acvp = new ethers.Contract("0x3b640c248e488f2d25f481828312f60ce7075f30", ACVP.abi, wallet);
let acvpBorrower = new ethers.Contract("0x3b640c248e488f2d25f481828312f60ce7075f30", ACVP.abi, borrowerWallet);
let dai = new ethers.Contract(DAI, A_TOKEN, borrowerWallet);

let oracle = new ethers.Contract("0xD4aD24B2cD6F3548B91070D3B5269c04A76E7331", ORACLE.abi, wallet);
let manager = new ethers.Contract("0x87bbF6BF9f6bcb478ED40d83Ed5311954726f831", MANAGER.abi, wallet);
let managerB = new ethers.Contract("0x87bbF6BF9f6bcb478ED40d83Ed5311954726f831", MANAGER.abi, borrowerWallet);
let bal = new ethers.Contract("0x645bae5677852a05ce2496159280af63bce6a7d6", BAL_POOL, borrowerWallet);
let usdt = new ethers.Contract(USDT, A_TOKEN, borrowerWallet);
let weth = new ethers.Contract(WETH, A_TOKEN, borrowerWallet);
let vault = new ethers.Contract("0x2fb025e4f1ba6eacc20d485d9ccd387d0c4c6845", VAULT.abi, borrowerWallet);
let mUSD = new ethers.Contract(M_USD, M_ASSET.abi, borrowerWallet);
let mSavings = new ethers.Contract("0x54ac0bdf4292f7565af13c9fbef214eeeb2d0f87", M_SAVINGS.abi, borrowerWallet);

let ba = new ethers.Contract("0x13D6bEc74c6eB443FbBFDfcED7BB07d1005e457e", BA.abi, borrowerWallet);


async function depositAave() {
  console.log("Deposit Aave");
  let amount = ethers.utils.parseEther("1");
  let tx = await aavePool.deposit(ETHER, amount, 0, {value: amount, gasLimit: 500000});
  console.log(tx);
}

async function checkDelegatorBalance() {
  let address = await wallet.getAddress();
  console.log("My address: " + address);

  let balance = await provider.getBalance(address);
  console.log("My balance: " + ethers.utils.formatEther(balance));

  let balanceAUSDT = await aUsdt.balanceOf(address);
  console.log("aUSDT balance: " + ethers.utils.formatUnits(balanceAUSDT, 6));

}

async function checkBorrowerBalance() {
  let address = await borrowerWallet.getAddress();
  console.log("My address: " + address);

  let balance = await provider.getBalance(address);
  console.log("My balance: " + ethers.utils.formatEther(balance));

  let balance2 = await aEth.balanceOf(address);
  console.log("aEth balance: " + ethers.utils.formatEther(balance2));

  let usdtBalance = await usdt.balanceOf(address);
  console.log("USDT balance: " + ethers.utils.formatUnits(usdtBalance, 6));

  let wethBalance = await weth.balanceOf(address);
  console.log("WETH balance: " + ethers.utils.formatEther(wethBalance));


}

async function checkOracle() {
  let oPriceUsdt = await oracle.getAssetPrice(usdt.address);
  console.log("USDT price from chainlink: " + ethers.utils.formatEther(oPriceUsdt));

  let usdtVal = await oracle.getAssetValue(usdt.address, 380000000);
  console.log("USDT value for 380usd from chainlink: " + ethers.utils.formatEther(usdtVal));

  let ethPrice = await oracle.getEthPrice();
  console.log("Eth price: " + ethers.utils.formatEther(ethPrice));

  let wethPrice = await oracle.getAssetPrice(weth.address);
  console.log("Weth price: " + ethers.utils.formatEther(wethPrice));

  let wethValue = await oracle.getAssetValue(weth.address, ethers.utils.parseEther("1"));
  console.log("Weth value: " + ethers.utils.formatEther(wethValue));
}

async function checkBA() {
  console.log("BA address: " + ba.address);

  let ethBalance = await provider.getBalance(ba.address);
  console.log("Eth balance: " + ethers.utils.formatEther(ethBalance));

  let balance = await ba.getAssetBalance(usdt.address);
  console.log("Usdt balance: " + ethers.utils.formatUnits(balance, 6));

  let val = await ba.getAssetValue(usdt.address);
  console.log("Usdt value: " + ethers.utils.formatEther(val));

  let bptBalance = await bal.balanceOf(ba.address);
  console.log("BPT balance: " + ethers.utils.formatEther(bptBalance));

  let bptValue = await oracle.getBPTValue(bal.address, bptBalance);
  console.log("BPT value in USD: " + ethers.utils.formatEther(bptValue));

  let total = await ba.getAccountValue();
  console.log("Total value: " + ethers.utils.formatEther(total));

  let debt = await ba.getMyDebt();
  console.log("Debt: " + ethers.utils.formatEther(debt));

  let solvency = await ba.getSolvencyRatio();
  console.log("Solvency: " + parseFloat(solvency)/10 + "%");

}

async function deployManager() {
  console.log("Deploying manager");
  let factory = new ethers.ContractFactory(MANAGER.abi, MANAGER.bytecode, wallet);
  let tx = await factory.deploy(acvp.address, oracle.address, oracle.address, {gasLimit: 10000000});
  console.log(tx);
}

async function createAccount() {
  let tx = await managerB.createAccount({gasLimit: 3000000});
  console.log(tx);
}

async function deployBa() {
  let address = await borrowerWallet.getAddress();
  let factory = new ethers.ContractFactory(BA.abi, BA.bytecode, borrowerWallet);
  let tx = await factory.deploy(1200, oracle.address, managerB.address, address);

  await provider.waitForTransaction(tx.deployTransaction.hash);
  let receipt = await provider.getTransactionReceipt(tx.deployTransaction.hash);

  console.log(receipt.contractAddress);
}


async function deposit() {
  console.log("Depositing...");

  // let tx = await aUsdt.approve(manager.address, ethers.utils.parseEther("1000"));
  //
  // console.log("Waiting for approval to be mined: " + tx.hash);
  // await provider.waitForTransaction(tx.hash);
  //
  // tx = await manager.deposit(USDT, aUsdt.address, ethers.utils.parseUnits("100", 6), {gasLimit: 2000000});

  let tx = await aEth.approve(manager.address, ethers.utils.parseEther("1000"));

  console.log("Waiting for approval to be mined: " + tx.hash);
  await provider.waitForTransaction(tx.hash);

  tx = await manager.deposit(USDT, aEth.address, ethers.utils.parseEther("0.01"), {gasLimit: 2000000});

  console.log(tx);
}

async function join() {
  console.log("Approving...");

  // let tx = await usdt.approve(bal.address, ethers.utils.parseUnits("1000", 6));
  //
  // console.log("Waiting for usdt approval to be mined: " + tx.hash);
  // await provider.waitForTransaction(tx.hash);
  //
  // tx = await weth.approve(bal.address, ethers.utils.parseEther("1"));
  //
  // console.log("Waiting for weth approval to be mined: " + tx.hash);
  // await provider.waitForTransaction(tx.hash);

  let tx = await bal.joinPool(ethers.utils.parseEther("1"), [ethers.utils.parseEther("1"), ethers.utils.parseUnits("1000", 6)],
    {gasLimit: 2000000});

  console.log(tx);
}

async function borrow() {
  console.log("Borrowing funds");

  //let tx = await acvp.getVaultAccountData("0x2fb025e4f1ba6eacc20d485d9ccd387d0c4c6845");
  //console.log(ethers.utils.formatEther(tx.availableBorrowsUSD));

  let tx = await ba.borrow(USDT,ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});

  await provider.waitForTransaction(tx.hash);
  console.log(tx.hash);
}

async function fund() {
  let tx = await usdt.approve(ba.address, ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});

  console.log("Waiting for approval to be mined: " + tx.hash);
  await provider.waitForTransaction(tx.hash);

  tx = await ba.fund(usdt.address, ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});
  console.log(tx);
}

async function fundEther() {
  let tx = await ba.fund(ZERO, ethers.utils.parseEther("0.01"), {gasLimit: 1000000, value: ethers.utils.parseEther("0.01")});
  console.log(tx);
}

async function withdraw() {
  let tx = await ba.withdraw(usdt.address, ethers.utils.parseUnits("0.05", 6), {gasLimit: 1000000});
  console.log(tx);
}

async function repay() {
  let tx = await ba.repay(usdt.address,ethers.utils.parseUnits("0.01", 6), {gasLimit: 1000000});
  console.log(tx);
}

async function investBal() {
  let tx = await ba.investIntoBalancer(bal.address, ethers.utils.parseEther("1"), [weth.address, usdt.address],
    [ethers.utils.parseEther("0.003"),ethers.utils.parseUnits("1", 6)], {gasLimit: 2000000});
  console.log(tx);
}

async function investMusd() {
  // let tx = await usdt.approve(mUSD.address, ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});
  //
  // console.log("Waiting for approval to be mined: " + tx.hash);
  // await provider.waitForTransaction(tx.hash);
  //
  // tx = await mUSD.mint(usdt.address, ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});
  // console.log(tx.hash);
  // let tx = await mUSD.approve(mSavings.address, ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});
  //
  // console.log("Waiting for approval to be mined: " + tx.hash);
  // await provider.waitForTransaction(tx.hash);
  //
  // tx = await mSavings.depositSavings(ethers.utils.parseUnits("1", 6), {gasLimit: 1000000});
  // console.log(tx.hash);
  let tx = await ba.investIntoMetaSavings(usdt.address, ethers.utils.parseUnits("1", 6), {gasLimit: 2000000});
  console.log(tx);

}

async function execute() {
  await deposit();

}



execute();
