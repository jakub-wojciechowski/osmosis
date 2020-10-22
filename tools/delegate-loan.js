const fs = require('fs');
const ethers = require('ethers');
const utils = ethers.utils;
const AAVE_LENDING_POOL = require('./abi/LendingPool.json');
const A_TOKEN = require('../src/blockchain/abi/AToken.json');
const ACVP = require('../build/contracts/AaveCollateralVaultProxy.json');


const ETHER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
const USDT = "0x13512979ade267ab5100878e2e0f485b568328a4";

const mnemonic = fs.readFileSync("../.secret").toString().trim();

let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
let provider = ethers.getDefaultProvider('kovan');
let wallet = mnemonicWallet.connect(provider);

let path = "m/44'/60'/1'/0/0";
let borrowerMnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);
let borrowerWallet = borrowerMnemonicWallet.connect(provider);


let aavePool = new ethers.Contract("0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c", AAVE_LENDING_POOL, wallet);
let aEth = new ethers.Contract("0xD483B49F2d55D2c53D32bE6efF735cB001880F79", A_TOKEN, wallet);
let acvp = new ethers.Contract("0x3b640c248e488f2d25f481828312f60ce7075f30", ACVP.abi, wallet);
let acvpBorrower = new ethers.Contract("0x3b640c248e488f2d25f481828312f60ce7075f30", ACVP.abi, borrowerWallet);
let dai = new ethers.Contract(DAI, A_TOKEN, borrowerWallet);
let usdt = new ethers.Contract(USDT, A_TOKEN, borrowerWallet);

async function liquidate(owner, amount) {
  console.log("Liquidating loan owned by: " + owner + " trying to repay: " + amount + " usd");
  let loanAddress = await factory.creatorsToAccounts(owner);
  console.log("Smart loan address: " + loanAddress);
  let loan = new ethers.Contract(loanAddress, SMART_LOAN.abi, wallet);
  let tx = await loan.liquidate(utils.parseEther(amount), {gasLimit: 2000000});
  console.log("Liquidation tx: " + tx.hash);
}

async function depositAave() {
  console.log("Deposit Aave");
  let amount = ethers.utils.parseEther("0.1");
  let tx = await aavePool.deposit(ETHER, amount, 0, {value: amount, gasLimit: 500000});
  console.log(tx);
}

async function checkBalance() {
  let address = await wallet.getAddress();
  console.log("My address: " + address);

  let balance = await provider.getBalance(address);
  console.log("My balance: " + ethers.utils.formatEther(balance));

  let balance2 = await aEth.balanceOf(address);
  console.log("aEth balance: " + ethers.utils.formatEther(balance2));
}

async function checkBorrowerBalance() {
  let address = await borrowerWallet.getAddress();
  console.log("My address: " + address);

  let balance = await provider.getBalance(address);
  console.log("My balance: " + ethers.utils.formatEther(balance));

  let balance2 = await aEth.balanceOf(address);
  console.log("aEth balance: " + ethers.utils.formatEther(balance2));

  let balance3 = await dai.balanceOf(address);
  console.log("DAI balance: " + ethers.utils.formatEther(balance3));

  let usdtBalance = await usdt.balanceOf(address);
  console.log("USDT balance: " + ethers.utils.formatEther(usdtBalance));
}

async function deployACVP() {
  let factory = new ethers.ContractFactory(ACVP.abi, ACVP.bytecode, wallet);
  let tx = await factory.deploy();
  console.log(tx);
}

async function deployVault() {
  let tx = await acvp.deployVault(DAI);
  console.log(tx);
}

async function sendEth() {
  let target = await borrowerWallet.getAddress();
  let tx = await wallet.sendTransaction({to: target, value: ethers.utils.parseEther("0.1")});
  console.log(tx);
}

async function incLimit() {
  let address = await borrowerWallet.getAddress();
  let tx = await acvp.increaseLimit("0x5Eb423f273A189F7a2De8A8E215747502B1e5fc7", address, ethers.utils.parseEther("0.1"));
  console.log(tx);
}

async function deposit() {
  let address = await wallet.getAddress();
  //let tx = await aEth.approve(acvp.address, ethers.utils.parseEther("100"));

  //let tx = await acvp.deposit("0x5Eb423f273A189F7a2De8A8E215747502B1e5fc7", "0xD483B49F2d55D2c53D32bE6efF735cB001880F79", ethers.utils.parseEther("0.1"), {gasLimit: 2000000});

  //let tx = await acvp.isVault("0xcD64Ab54A7E912BcE1a7f7f17bfd884d6325F027");
  //let tx = await aEth.allowance(address, "0xcD64Ab54A7E912BcE1a7f7f17bfd884d6325F027");
  //console.log(ethers.utils.formatEther(tx));
  console.log(tx);
}

async function borrow() {
  let address = await borrowerWallet.getAddress();
  let tx = await acvpBorrower.borrow("0x5Eb423f273A189F7a2De8A8E215747502B1e5fc7", DAI, ethers.utils.parseEther("0.05"), {gasLimit: 2000000});
  console.log(tx);
}

async function getVaults() {
  let address = await wallet.getAddress();
  let tx = await acvp.getVaults(address);
  console.log(tx);
}

async function getAave() {
  let tx = await acvp.getAave();
  console.log(tx);
}



//0xcd64ab54a7e912bce1a7f7f17bfd884d6325f027


async function execute() {
  await checkBorrowerBalance();
}



execute();
