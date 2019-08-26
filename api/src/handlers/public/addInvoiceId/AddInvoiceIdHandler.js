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
        port: 3333, // this is the default port
        onConnect() { console.log('MetaMask client connected') }, // Function to run when MetaMask is connected (optional)
    });

    connector.start().then(() => {
        // Now go to http://localhost:3333 in your MetaMask enabled web browser.
        const web3 = new Web3(connector.getProvider());
        // Use web3 as you would normally do. Sign transactions in the browser.
    });

    console.log('Web3: ', web3)

    try {
    //     var ethAccountToUse = accountAddressList[0];
    // var deployedAddressInvoice = "0xf6499E3029c704A70dc6389dA71D60f544463469";
    
    // var invoice = new web3.eth.Contract(JSON.parse(value[0]),deployedAddressInvoice);
    // global.invoice = invoice;
    
    // var result = await invoice.methods.isHashExists(hashVal).call({from : ethAccountToUse});
    // console.log("isHashExists after", result);
    
    // let encodedABI = invoice.methods.addInvoice(invoiceID,hashVal).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedAddressInvoice,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for Invoice Setvalue -", transactionObject.transactionHash);

        getWeb3.get().then((web3) => {
            console.log('Web3: ', web3)
            web3.eth.getAccounts().then((accounts) => {
                console.log(accounts);
                getContarct.get(web3, contractDef).then((contract) => {    
                    console.log(accounts)
                    // contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: "0x74f68A6e428f060a1Dff3e9C89d22F2504416499", gas:3000000 }).then((txResult) => {
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
