module.exports = {
  networks: {
    flinders: {
      host: 'flinders01.ledgerium.io', //flinders testnet, 'toorak01.ledgerium.io' for toorak
      port: 8545, //Need to check with RPC port of the specific ledgerium node, default 8545
      network_id: '2019', // Match any network id
      from: '0xd34fC4abe46BfDb1939e00b3dcd5B27911a6C05d'
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