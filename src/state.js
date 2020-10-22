/* eslint-disable */
let state = {
  pool: {
    myDeposits: 0,
    myBorrowed: 0,
    totalDeposited: 0,
    totalBorrowed: 0,
    depositRate: 0,
    borrowingRate: 0,
    ethRate: 0,
    history: [],
    depositInterests: 0,
    borrowingInterests: 0,
    availableAusd: 0,
    rate: 0
  },
  account: {
    isCreated: undefined,
    totalValue: 0,
    solvency: 0,
    totalBorrowed: 0,
    assets: [
      {name: "Ether", symbol: "eth", rate: 0.0268, price: 0,  balance: 0, borrowed: 0, total: 0},
      {name: "UsdT", symbol: "USDT", rate: 0.0438, price: 0, balance: 0, borrowed: 0, total: 0},
    ],
    investments: [
      {name: "Balancer", apy: 0.375,  balance: 0, total: 0},
      {name: "Meta Savings", apy: 0.114, balance: 0, total: 0},
    ],
    borrowingRate: 0,
    netRate: 0,
    investmentRate: 0
  }
};

export default state;
