const express       = require('express');
const router        = express.Router();
const getWeb3       = require('./../../lib/getWeb3');

router.post('/', (req, res) => {
    try {
        getWeb3.get().then((web3) => {
            console.log('web3: ', web3)
            web3.eth.getAccounts().then((accounts) => {
                console.log('Accounts: ', accounts)               
                res.send({status: true, accounts: accounts});
            })
        })
    } catch {
        res.send({status: false})
    }
})

module.exports = router;
