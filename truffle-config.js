module.exports = {
  networks: {
    development: {
      host: 'testnet.ledgerium.net', //toorak testnet, '138.197.193.201' for flinders
      port: 8545, //Need to check with RPC port of the specific ledgerium node, default 8545
      network_id: '*', // Match any network id
      from: '0x74f68A6e428f060a1Dff3e9C89d22F2504416499'
    }
  },
  solc: {
    // Turns on the Solidity optimizer. For development the optimizer's
    // quite helpful, just remember to be careful, and potentially turn it
    // off, for live deployment and/or audit time. For more information,
    // see the Truffle 4.0.0 release notes.
    //
    // https://github.com/trufflesuite/truffle/releases/tag/v4.0.0
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};