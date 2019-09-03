const express       = require('express');
const router        = express.Router();
const getWeb3       = require('./../../lib/getweb3');

router.post('/', (req, res) => {
    try {
        getWeb3.get().then((web3) => {
            web3.eth.getAccounts().then((accounts) => {
                res.send({status: true, accounts: accounts});
            })
        })
    } catch {
        res.send({status: false})
    }
})

module.exports = router;
