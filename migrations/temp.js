const Web3 =  require('web3');

const Invoice = artifacts.require('./Invoice.sol')

module.exports = function (deployer, network, addresses) {
    let web3 = new Web3( new Web3.providers.HttpProvider('http://' + host + ':', port));
    web3.personal.unlockAccount()
    deployer.deploy(Invoice)
}

