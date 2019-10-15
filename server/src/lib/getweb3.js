const Web3 = require('web3');
const {
    PROVIDER,
    ACCOUNT
} = require('./../globalconfig')

get = async () => {
    return new Promise((resolve) => {        
        let web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER))
        web3.eth.personal.unlockAccount(ACCOUNT,"password").then((result) => {  
            resolve(web3);
        });
    })
}

getHttp = async () => {
    return new Promise((resolve) => {
        let web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER))        
        resolve(web3);
    })
}

exports.get     = get;
exports.getHttp = getHttp;
