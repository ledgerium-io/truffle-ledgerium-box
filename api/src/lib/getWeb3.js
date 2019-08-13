const Web3 = require('web3');
const {
    PROVIDER
} = require('./../globalConfig')

get = async () => {
    return new Promise((resolve) => {
      resolve(new Web3(new Web3.providers.HttpProvider(PROVIDER)));
    })
}

exports.get = get;

