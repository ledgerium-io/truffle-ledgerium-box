const express       = require('express');
const router        = express.Router();
const getWeb3       = require('./../../../lib/getweb3');
const getContract   = require('./../../../lib/getcontract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');

router.post('/', (req, res) => {
    let invoiceIdHash = req.body.invoiceIdHash;
    let hostAddress = req.body.hostAddress;
    let hostIp  = req.body.hostIp;

    let host = `http://${hostAddress}:${hostIp}`;

    try {
        getWeb3.getHttp(host).then((web3) => {    
            web3.eth.getAccounts().then((accounts) => {
                getContract.getPrivate(web3, contractDef).then((contract) => {    
                    contract.methods.isHashExists(invoiceIdHash).call({ from: accounts[0] }).then((queryResult) => {
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
