const express       = require('express');
const router        = express.Router();
const getWeb3       = require('../../../lib/getWeb3');
const getContarct   = require('../../../lib/getContract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');

router.post('/', (req, res) => {
    let invoiceId =  req.body.invoiceId;
    let invoiceIdHash = req.body.invoiceIdHash;

    try {
        getWeb3.get().then((web3) => {
            console.log('Web3: ', web3)
            web3.eth.getAccounts().then((accounts) => {
                getContarct.get(web3, contractDef).then((contract) => {    
                    console.log(accounts)
                    contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: accounts[0], gas:3000000 }).then((txResult) => {
                        console.log('Tx Result: ', JSON.stringify(txResult));
                        res.send({status: true, txResult: txResult});
                    })
                })
            })
        })
    } catch (error) {
        res.send({status: false});
    }
})

module.exports = router;
