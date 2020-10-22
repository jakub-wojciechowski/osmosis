import CREDIT_MANAGER from '@contracts/CreditManager.json'
import BROKERAGE_ACCOUNT from '@contracts/BrokerageAccount.json'
import A_TOKEN_ABI from './abi/AToken.json'

import { getProvider, getMainAccount } from "./network.js"
import state from "@/state";

const ethers = require('ethers');
const utils = ethers.utils;

const ZERO = "0x0000000000000000000000000000000000000000";
const A_USD = "0x02F626c6ccb6D2ebC071c068DC1f02Bf5693416a";
const USDT = "0x13512979ade267ab5100878e2e0f485b568328a4";
const WETH = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";
const M_SAVINGS = "0x54Ac0bdf4292F7565Af13C9FBEf214eEEB2d0F87";
const M_USD = "0x70605Bdd16e52c86FC7031446D995Cf5c7E1b0e7";

const BAL_WETH_USDT  = "0x645bae5677852a05ce2496159280af63bce6a7d6";




var cachedManager, cachedAusd, cachedBA;

async function getManager() {
  if (!cachedManager) {
    let provider = await getProvider();
    cachedManager = new ethers.Contract(CREDIT_MANAGER.networks["42"].address, CREDIT_MANAGER.abi, provider.getSigner());
    cachedManager.iface = new ethers.utils.Interface(CREDIT_MANAGER.abi);
    console.log("Connected to the credit manager: " + cachedManager.address);
  }
  return cachedManager;
}

async function getBA() {
  if (!cachedBA) {
    let provider = await getProvider();
    cachedBA = new ethers.Contract(state.account.address, BROKERAGE_ACCOUNT.abi, provider.getSigner());
    console.log("Connected to the brokerage account: " + cachedBA.address);
  }
  return cachedBA;
}

async function getAusd() {
  if (!cachedAusd) {
    let provider = await getProvider();
    cachedAusd = new ethers.Contract(A_USD, A_TOKEN_ABI, provider.getSigner());
    console.log("Connected to the aUSD: " + cachedAusd.address);
  }
  return cachedAusd;
}


export async function getBrokerageAccount() {
  let manager = await getManager();
  let main = await getMainAccount();

  let brokerageAccount = await manager.getAccountForOwner(main);
  state.account.address  = brokerageAccount;
  state.account.isCreated  = brokerageAccount != ZERO;
  console.log("Brokerage account: " + state.account.address);

  if (state.account.isCreated) {
    await getAccountStats();
  }
}

export async function createAccount(margin) {
  console.log("Creatign account with margin: " + margin);

  let manager = await getManager();
  let provider = await getProvider();

  let tx = await manager.createAccount({gasLimit: 5000000, value: ethers.utils.parseEther(margin)});
  console.log("Created: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);

  await getBrokerageAccount();
}

export async function getAccountStats() {
  let ba = await getBA();
  let provider = await getProvider();

  //Account stats
  state.account.totalValue = parseFloat(ethers.utils.formatEther(await ba.getAccountValue()));
  state.account.totalBorrowed = parseFloat(ethers.utils.formatEther(await ba.getMyDebt()));
  state.account.solvency = parseFloat(await ba.getSolvencyRatio())/1000;


  //Assets

  //Eth
  state.account.assets[0].balance = parseFloat(ethers.utils.formatEther(await provider.getBalance(ba.address)));
  state.account.assets[0].price = parseFloat(ethers.utils.formatEther(await ba.getAssetPrice(WETH)));
  state.account.assets[0].total = state.account.assets[0].balance * state.account.assets[0].price;

  //UsdT
  state.account.assets[1].balance = parseFloat(ethers.utils.formatUnits(await ba.getAssetBalance(USDT), 6));
  state.account.assets[1].borrowed = parseFloat(ethers.utils.formatEther(await ba.getMyDebt()));
  state.account.assets[1].price = parseFloat(ethers.utils.formatEther(await ba.getAssetPrice(USDT)));
  //state.account.assets[1].total = state.account.assets[1].balance * state.account.assets[1].price;
  state.account.assets[1].total = parseFloat(ethers.utils.formatEther(await ba.getAssetValue(USDT)));



  let musd = parseFloat(ethers.utils.formatEther(await ba.getAssetValue(M_USD)));
  console.log("MUSD: " + musd);


  //Investments

  //BPT
  state.account.investments[0].balance = parseFloat(ethers.utils.formatEther(await ba.getAssetBalance(BAL_WETH_USDT)));
  state.account.investments[0].total = parseFloat(ethers.utils.formatEther(await ba.getAssetValue(BAL_WETH_USDT)));

  //UsdT
  state.account.investments[1].balance = parseFloat(ethers.utils.formatUnits(await ba.getAssetBalance(M_SAVINGS), 6));
  state.account.investments[1].total = parseFloat(ethers.utils.formatEther(await ba.getAssetValue(M_SAVINGS)));


  //Rates
  let rawYield =
    state.account.investments[0].total * state.account.investments[0].apy
  + state.account.investments[1].total * state.account.investments[1].apy;

  state.account.borrowingRate =
    (state.pool.rate + state.account.assets[1].rate)
    * state.account.totalBorrowed
    / state.account.totalValue;

  state.account.investmentRate = rawYield / state.account.totalValue;

  state.account.netRate = (state.account.investmentRate - state.account.borrowingRate)
    * state.account.totalValue / (state.account.totalValue - state.account.totalBorrowed);
}

export async function borrow(amount) {
  console.log("Borrowing: " + amount);

  let ba = await getBA();
  let provider = await getProvider();

  let tx = await ba.borrow(USDT,ethers.utils.parseUnits(amount, 6), {gasLimit: 1000000});

  console.log("Borrowed: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);

  await getAccountStats();
}

export async function repay(amount) {
  console.log("Repaying: " + amount);

  let provider = await getProvider();
  let ba = await getBA();

  let tx = await ba.repay(USDT, ethers.utils.parseUnits(amount, 6), {gasLimit: 1000000});
  console.log("Repaid: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);

  await getAccountStats();
}

export async function investBalancer(amount) {
  console.log("Investing into Balancer: " + amount);

  let ba = await getBA();
  let provider = await getProvider();

  let tx = await ba.investIntoBalancer(BAL_WETH_USDT, ethers.utils.parseEther(amount.toString()), [WETH, USDT],
    [
      ethers.utils.parseEther(state.account.assets[0].balance.toString()),
      ethers.utils.parseUnits(state.account.assets[1].balance.toString(), 6)
    ], {gasLimit: 2000000});
  console.log(tx);

  console.log("Invested into Balancer: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);

  await getAccountStats();
}

export async function investMeta(amount) {
  console.log("Investing into Meta: " + amount);

  let ba = await getBA();
  let provider = await getProvider();

  let tx = await ba.investIntoMetaSavings(USDT, ethers.utils.parseUnits(amount.toString(), 6), {gasLimit: 2000000});
  console.log(tx);

  console.log("Invested into Meta: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);

  await getAccountStats();
}

