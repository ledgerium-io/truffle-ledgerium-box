const express       = require('express');
const router        = express.Router();
const getWeb3       = require('../../../lib/getweb3');
const getContract   = require('../../../lib/getcontract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');
const LedgeriumWalletConnector = require('node-metamask');

router.post('/', (req, res) => {
    let invoiceId       = req.body.invoiceId;
    let invoiceIdHash   = req.body.invoiceIdHash;
    let web3            = req.body.web3;
    const connector = new LedgeriumWalletConnector({
        port: 8545, // this is the default port
        onConnect() { console.log('Ledgerium Wallet client connected') }, // Function to run when Ledgerium Wallet is connected (optional)
    });

    connector.start().then(() => {
        // Now go to http:// in your Ledgerium Wallet enabled web browser.
        const web3 = new Web3(connector.getProvider());
        // Use web3 as you would normally do. Sign transactions in the browser.
    });
    try {
        getWeb3.get().then((web3) => {
            web3.eth.getAccounts().then((accounts) => {
                getContract.get(web3, contractDef).then((contract) => {    
                    console.log(`Invoice Id ${invoiceId}, Invoice Hash ${invoiceIdHash}`);
                    contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: "0xd34fC4abe46BfDb1939e00b3dcd5B27911a6C05d", gas:300000 }).then((txResult) => {
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
