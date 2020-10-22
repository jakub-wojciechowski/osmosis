import CREDIT_MANAGER from '@contracts/CreditManager.json'
import A_TOKEN_ABI from './abi/AToken.json'

import { getProvider, getMainAccount } from "./network.js"
import state from "@/state";

const ethers = require('ethers');
const utils = ethers.utils;

const A_USD = "0x02F626c6ccb6D2ebC071c068DC1f02Bf5693416a";
const USDT = "0x13512979ade267ab5100878e2e0f485b568328a4";

var cachedManager, cachedAusd;

async function getManager() {
  if (!cachedManager) {
    let provider = await getProvider();
    cachedManager = new ethers.Contract(CREDIT_MANAGER.networks["42"].address, CREDIT_MANAGER.abi, provider.getSigner());
    cachedManager.iface = new ethers.utils.Interface(CREDIT_MANAGER.abi);
    console.log("Connected to the credit manager: " + cachedManager.address);
  }
  return cachedManager;
}

async function getAusd() {
  if (!cachedAusd) {
    let provider = await getProvider();
    cachedAusd = new ethers.Contract(A_USD, A_TOKEN_ABI, provider.getSigner());
    console.log("Connected to the aUSD: " + cachedAusd.address);
  }
  return cachedAusd;
}


export async function getMyDeposits() {
  let manager = await getManager();
  let ausd = await getAusd();
  let main = await getMainAccount();

  let poolDepositorBalance = await manager.getDeposited(main);
  state.pool.myDeposits  = parseFloat(ethers.utils.formatUnits(poolDepositorBalance, 6));
  console.log("User delegated: " + state.pool.myDeposits);

  let poolTotalDeposited = await manager.totalDeposited();
  state.pool.totalDeposited  = parseFloat(ethers.utils.formatUnits(poolTotalDeposited, 6));
  console.log("Total delegated: " + state.pool.myDeposits);

  let aUsdBalance = await ausd.balanceOf(main);
  state.pool.availableAusd  = parseFloat(ethers.utils.formatUnits(aUsdBalance,6));
  console.log("Available aUSD: " + state.pool.availableAusd);

  let rate = await manager.getDelegationRate();
  state.pool.rate  = parseFloat(ethers.utils.formatEther(rate));
  console.log("Delegation rate: " + state.pool.rate);



  // let totalDeposited = 0;
  // let totalWithdrawn = 0;
  //
  // let provider = await getProvider();
  // let logs = await provider.getLogs({
  //   fromBlock: 0,
  //   toBlock: 'latest',
  //   address: pool.address});
  // let events = logs.map(log => {
  //   console.log(log);
  //   let parsed = pool.iface.parseLog(log);
  //   let event = {
  //     type: parsed.name,
  //     time: new Date(parseInt(parsed.values.time.toString())*1000),
  //     value: parseFloat(ethers.utils.formatEther(parsed.values.value)),
  //     tx: log.transactionHash
  //   };
  //   if (event.type === 'Deposit') totalDeposited += event.value;
  //   if (event.type === 'Withdrawal') totalWithdrawn += event.value;
  //   return event;
  // });
  //
  // state.pool.depositInterests = state.pool.myDeposits - totalDeposited + totalWithdrawn;
  //
  // console.log("T deposited: " + totalDeposited);
  // console.log("T withdrawn: " + totalWithdrawn);
  // console.log("Interests: " + state.pool.depositInterests);
  //
  //
  // events = Array.sort(events, (a,b) => b.time - a.time);
  // console.log(events);
  // state.pool.history.length = 0;
  // state.pool.history = state.pool.history.concat(events);


}

export async function sendDeposit(amount) {
  console.log("Delegating: " + amount);
  let provider = await getProvider();
  let manager = await getManager();
  let ausd = await getAusd();
  let main = await getMainAccount();

  let approved = parseFloat(await ausd.allowance(main, manager.address));
  if (approved == 0) {
    console.log("Not approved");
    await ausd.approve(manager.address, ethers.utils.parseUnits("1000000", 6), {gasLimit: 300000});
  }

  let tx = await manager.deposit(USDT, A_USD, ethers.utils.parseUnits(amount, 6), {gasLimit: 2000000});
  console.log("Delegated: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);
  await getMyDeposits();
}

export async function withdraw(amount) {
  console.log("Withdrawing: " + amount);

  let provider = await getProvider();
  let manager = await getManager();

  let tx = await manager.withdraw(USDT, A_USD, ethers.utils.parseUnits(amount, 6), {gasLimit: 2000000});
  console.log("Withdrawn: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log(receipt);

  await getMyDeposits();
}


