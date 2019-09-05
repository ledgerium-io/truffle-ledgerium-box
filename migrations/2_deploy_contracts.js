const Web3 =  require('web3');
const Invoice = artifacts.require('./Invoice.sol')
const host = require("../truffle-config.js").networks.flinders.host;
const port = require("../truffle-config.js").networks.flinders.port;
const account = require("../truffle-config.js").networks.flinders.from;

module.exports = function (deployer) {
  let URL = 'http://' + host + ':' + port;
  let web3 = new Web3(new Web3.providers.HttpProvider(URL));
  web3.personal.unlockAccount(account,"password");
  deployer.deploy(Invoice)
}
