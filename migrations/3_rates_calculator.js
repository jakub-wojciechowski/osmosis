var UtilisationRatesCalculator = artifacts.require("./UtilisationRatesCalculator.sol");

const toWei = web3.utils.toWei;

module.exports = function(deployer) {
  deployer.deploy(UtilisationRatesCalculator, toWei("0.1"), toWei("0.01"));
};
