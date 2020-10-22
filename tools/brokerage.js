const fs = require('fs');
const ethers = require('ethers');
const utils = ethers.utils;
const BA = require('../build/contracts/BrokerageAccount.json');
const A_TOKEN = require('../src/blockchain/abi/AToken.json');
const ORACLE = require('../build/contracts/ChainlinkPriceProvider.json');
const M_ASSET = require('./abi/Masset.json');


const ETHER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
const M_USD = "0x70605Bdd16e52c86FC7031446D995Cf5c7E1b0e7";
const USDT = "0x13512979ade267ab5100878e2e0f485b568328a4";

const mnemonic = fs.readFileSync("../.secret").toString().trim();

let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
let provider = ethers.getDefaultProvider('kovan');
let wallet = mnemonicWallet.connect(provider);

let path = "m/44'/60'/1'/0/0";
let borrowerMnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);
let borrowerWallet = borrowerMnemonicWallet.connect(provider);


let ba = new ethers.Contract("0x1ef9d5cb920bc860de05ba32a5a5576f9ef49207", BA.abi, wallet);
let dai = new ethers.Contract(DAI, A_TOKEN, borrowerWallet);
let oracle = new ethers.Contract("0x63A45493F5C18efa073f0a277083F1f9AB4f3aaF", ORACLE.abi, wallet);
let mUSD = new ethers.Contract(M_USD, M_ASSET.abi, borrowerWallet);
let usdt = new ethers.Contract(USDT, A_TOKEN, borrowerWallet);

async function deployBA(owner, amount) {
  let address = await wallet.getAddress();
  let factory = new ethers.ContractFactory(BA.abi, BA.bytecode, wallet);
  let tx = await factory.deploy(1200, oracle.address, address);
  console.log(tx);
}

async function fund() {
  console.log("Funding BA");
  let amount = ethers.utils.parseEther("0.01");
  let tx = await dai.transfer(ba.address, amount);
  console.log(tx);
}

async function checkBA() {

  let balance = await ba.getAssetBalance(dai.address);
  console.log("Dai balance: " + ethers.utils.formatEther(balance));

  let price = await ba.getAssetPrice(dai.address);
  console.log("Dai price: " + price);

  let val = await ba.getAssetValue(dai.address);
  console.log("Dai value: " + ethers.utils.formatEther(balance));

  let oPrice = await oracle.getAssetPrice(dai.address);
  console.log("Dai price from chainlink: " + oPrice);

  let oPriceEth = await oracle.getAssetPrice(ETHER);
  console.log("Eth price from chainlink: " + oPriceEth);
}

async function checkBorrowerBalance() {
  let address = await borrowerWallet.getAddress();
  console.log("My address: " + address);

  let balance = await provider.getBalance(address);
  console.log("My balance: " + ethers.utils.formatEther(balance));

  // let balance2 = await aEth.balanceOf(address);
  // console.log("aEth balance: " + ethers.utils.formatEther(balance2));

  let balance3 = await dai.balanceOf(address);
  console.log("DAI balance: " + ethers.utils.formatEther(balance3));

  let usdtBalance = await usdt.balanceOf(address);
  console.log("USDT balance: " + ethers.utils.formatUnits(usdtBalance, 6));
}

async function checkBA() {

  let balance = await ba.getAssetBalance(usdt.address);
  console.log("Usdt balance: " + ethers.utils.formatEther(balance));

  let price = await ba.getAssetPrice(dai.address);
  console.log("Dai price: " + price);

  let val = await ba.getAssetValue(dai.address);
  console.log("Dai value: " + ethers.utils.formatEther(balance));

  let oPrice = await oracle.getAssetPrice(dai.address);
  console.log("Dai price from chainlink: " + oPrice);

  let oPriceEth = await oracle.getAssetPrice(ETHER);
  console.log("Eth price from chainlink: " + oPriceEth);
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

async function mintMusd() {
  //let tx = await usdt.approve(mUSD.address, ethers.utils.parseEther("100"));
  let tx = await mUSD.mint(usdt.address, ethers.utils.parseUnits("10", 6), {gasLimit: 1000000});
  console.log(tx);
}


async function execute() {
  await mintMusd();
}



execute();
