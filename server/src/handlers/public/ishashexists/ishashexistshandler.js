const express       = require('express');
const router        = express.Router();
const getWeb3       = require('./../../../lib/getweb3');
const getContract   = require('./../../../lib/getcontract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');
const account       = require('../../../globalconfig').ACCOUNT;

router.post('/', (req, res) => {
    let invoiceIdHash = req.body.invoiceIdHash;

    try {
        getWeb3.get().then((web3) => {
            web3.eth.getAccounts().then((accounts) => {
                getContract.get(web3, contractDef).then((contract) => {    
                    console.log('Invoice ID Hash: ', invoiceIdHash);
                    contract.methods.isHashExists(invoiceIdHash).call({from : account}, (err, queryResult) => {
                        console.log('Error: ', err);
                        console.log('Query Result: ', JSON.stringify(queryResult));
                        res.send({status: true, queryResult: queryResult});
                    })
                })
            })
        })
    } catch (error) {
        console.log("Error: ", error);
        res.send({status: false});
    }
})
module.exports = router;
