const express       = require('express');
const router        = express.Router();
const getWeb3       = require('../../../lib/getWeb3');
const getContarct   = require('../../../lib/getContract');
const contractDef   = require('./../../../lib/contracts/Invoice.json');
const MetaMaskConnector = require('node-metamask');

router.post('/', (req, res) => {
    let invoiceId       = req.body.invoiceId;
    let invoiceIdHash   = req.body.invoiceIdHash;
    let web3            = req.body.web3;
    const connector = new MetaMaskConnector({
        port: 8545, // this is the default port
        onConnect() { console.log('MetaMask client connected') }, // Function to run when MetaMask is connected (optional)
    });

    connector.start().then(() => {
        // Now go to http:// in your MetaMask enabled web browser.
        const web3 = new Web3(connector.getProvider());
        // Use web3 as you would normally do. Sign transactions in the browser.
    });

    console.log('Web3: ', web3)

    try {
        getWeb3.get().then((web3) => {
            console.log('Web3: ', web3)
            web3.eth.getAccounts().then((accounts) => {
                console.log(accounts);
                getContarct.get(web3, contractDef).then((contract) => {    
                    console.log(accounts)
                    contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: "0xd34fC4abe46BfDb1939e00b3dcd5B27911a6C05d", gas:300000 }).then((txResult) => {
                        // contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: accounts[0], gas:3000000 }).then((txResult) => {
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
