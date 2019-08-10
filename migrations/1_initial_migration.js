const Invoice = artifacts.require('./Invoice.sol')

module.exports = function (deployer) {
  deployer.deploy(Invoice)
}
