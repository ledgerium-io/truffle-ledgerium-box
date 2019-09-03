const Web3 = require('web3');
const {
    PROVIDER,
    ACCOUNT
} = require('./../globalconfig')

get = async () => {
    return new Promise((resolve) => {
        let web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER))
        web3.eth.personal.unlockAccount(ACCOUNT,"password").then((result) => {  
        // web3.eth.personal.unlockAccount("0x74f68A6e428f060a1Dff3e9C89d22F2504416499", 'happy001', 30000000).then((result) => {            
            resolve(web3);
        });
    })
}
exports.get = get;

