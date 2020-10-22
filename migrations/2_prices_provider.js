var ChainlinkPriceProvider = artifacts.require("./ChainlinkPriceProvider.sol");

//Aave price oracle
//https://kovan.etherscan.io/address/0x276c4793f2ee3d5bf18c5b879529dd4270ba4814#readContract


//Kovan assets
const USDT_ADDRESS = "0x13512979ade267ab5100878e2e0f485b568328a4";
const M_USD = "0x70605Bdd16e52c86FC7031446D995Cf5c7E1b0e7";


module.exports = function(deployer) {
  deployer.deploy(ChainlinkPriceProvider).then(function(instance) {
    instance.setChainlinkAggregator(USDT_ADDRESS, "0x0bF499444525a23E7Bb61997539725cA2e928138");
    instance.setChainlinkAggregator(M_USD, "0x0bF499444525a23E7Bb61997539725cA2e928138");
  });
};

