const Web3 = require('web3');
const {
    PROVIDER
} = require('./../globalConfig')

get = async () => {
    return new Promise((resolve) => {
        let web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER))
        web3.eth.personal.unlockAccount('0xa819e7ddd125fa5cd6506f2bdc83562185b1ed87', 'happy001', 30000000).then((result) => {
            console.log('Hello');
            resolve(web3);
        });
    })
}

exports.get = get;

