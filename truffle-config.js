module.exports = {
  networks: {
    development: {
      host: '138.197.193.201',
      port: 8545, // was 9000
      network_id: '*', // Match any network id
      from: '0xa819e7ddd125fa5cd6506f2bdc83562185b1ed87'
      // type: "quorum" // needed for Truffle to support Quorum
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
  },
  ignore: [
    "README.md",
    ".gitignore"
  ],
  commands: {
    "Compile": "truffle compile",
    "Migrate": "truffle migrate",
    "Test contracts": "truffle test",
    "Test dapp": "npm test",
    "Run dev server": "npm run start",
    "Build for production": "npm run build"
  },
  hooks: {
    "post-unpack": "npm install"
  }
};