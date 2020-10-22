var CreditManager = artifacts.require("./CreditManager.sol");
var ChainlinkPriceProvider = artifacts.require("./ChainlinkPriceProvider.sol");
var UtilisationRatesCalculator = artifacts.require("./UtilisationRatesCalculator.sol");

const AAVE_PROXY = "0x3b640c248e488f2d25f481828312f60ce7075f30";


module.exports = function(deployer) {
  deployer.deploy(CreditManager,
    AAVE_PROXY,
    ChainlinkPriceProvider.address,
    UtilisationRatesCalculator.address
  ).then(function(instance) {
    console.log("Credit manager deployed: " + instance.address);
  });
};
