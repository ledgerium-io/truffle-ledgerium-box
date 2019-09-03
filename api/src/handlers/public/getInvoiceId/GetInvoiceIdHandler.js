const express       = require('express');
const router        = express.Router();
const getWeb3       = require('./../../../lib/getWeb3');
const getContarct   = require('./../../../lib/getContract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');

router.post('/', (req, res) => {
    let invoiceIdHash = req.body.invoiceIdHash;

    try {
        getWeb3.get().then((web3) => {
            console.log('Web3: ', web3)
            web3.eth.getAccounts().then((accounts) => {
                getContarct.get(web3, contractDef).then((contract) => {    
                    console.log(accounts)
                    contract.methods.getInvoiceID(invoiceIdHash).call({ from: "0x74f68A6e428f060a1Dff3e9C89d22F2504416499" }).then((queryResult) => {
                        console.log('Query Result: ', JSON.stringify(queryResult));
                        res.send({status: true, queryResult: queryResult});
                    })        
                })
            })
        })
    } catch (error) {
        res.send({status: false});
    }
})

module.exports = router;
