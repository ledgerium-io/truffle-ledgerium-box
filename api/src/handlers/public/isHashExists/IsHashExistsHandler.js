const express       = require('express');
const router        = express.Router();
const getWeb3       = require('./../../../lib/getWeb3');
const getContract   = require('./../../../lib/getContract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');

router.post('/', (req, res) => {
    let invoiceIdHash = req.body.invoiceIdHash;

    try {
        getWeb3.get().then((web3) => {
            //console.log('Web3: ', web3)
            web3.eth.getAccounts().then((accounts) => {
                getContract.get(web3, contractDef).then((contract) => {    
                    console.log(accounts)
                    console.log(contract)
                    console.log('Invoice ID Hash: ', invoiceIdHash);
                    contract.methods.isHashExists(invoiceIdHash).call({from : "0xd34fC4abe46BfDb1939e00b3dcd5B27911a6C05d"}, (err, queryResult) => {
                        console.log('Error: ', err);
                        console.log('Query Result: ', JSON.stringify(queryResult));
                        res.send({status: true, queryResult: queryResult});
                    })
                    // .then((queryResult) => {
                    //     console.log('Query Result: ', JSON.stringify(queryResult));
                    //     res.send({status: true, queryResult: queryResult});
                    // })        
                })
            })
        })
    } catch (error) {
        console.log("Error: ", error);
        res.send({status: false});
    }
})

module.exports = router;
