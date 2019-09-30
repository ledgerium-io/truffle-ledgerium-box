const express           = require('express');
const path              = require('path');
const fs                = require('fs');
const quorumjs          = require('quorum-xlg-js');
const getWeb3           = require('../../../lib/getweb3');
const getContract       = require('../../../lib/getcontract');
const contractDef       = require('./../../../lib/contracts/Invoice.json');
const privateKeys       = require('./../../../keystore/privatekey.json')
const {
    PRIVATE_CONTRACT,
    PRIVATE_ACCOUNT       
} = require('./../../../globalconfig')
const sslCerts          = require('./../../../generatecerts')
const router            = express.Router();

router.post('/', (req, res) => {

    console.log(__dirname);
    const directoryPath = path.join(__dirname,'./../../../../certs')
    try {
        if(!fs.existsSync(directoryPath + '/cert.key') || !fs.existsSync(directoryPath + '/cert.pem')) {
            sslCerts.generateTLSCerts();
        }
    } catch(err) {
        console.error(err);
    }

    let invoiceId           = req.body.invoiceId;
    let invoiceIdHash       = req.body.invoiceIdHash;
    let fromPublicKey       = req.body.fromPublicKey;
    let toPublicKey         = req.body.toPublicKey;
    let fromHost            = req.body.fromHost;
    let toHost              = req.body.toHost;
    let fromPort            = req.body.fromPort;
    let toPort              = req.body.toPort;
    //let account             = req.body.account;
    let account             = "0x69c30d313cae3233ee4e4dc35d8ba203c6655224";
    let fromHostAddr        = `http://${fromHost}:${fromPort}`;
    let toPrivateURL        = `https://${fromHost}:${toPort}`;
    
    let tlsOptions;
    try {
         tlsOptions = {
            key: fs.readFileSync(directoryPath + '/cert.key'),
            clcert: fs.readFileSync(directoryPath + '/cert.pem'),
            allowInsecure: true
        }
    } catch (e) {
        if(e.code === 'ENOENT'){
            console.log('Unable to read the certificate files. Do they exist?')
        }
        else console.log(e)
        return
    }
    console.log("TLS: ", tlsOptions);

    getWeb3.getHttp(fromHostAddr)
    .then((web3) => {
        //getContract.getPrivate(web3, contractDef)
        let constructorParameters = [];
        getContract.getEncodedABI(contractDef, web3, constructorParameters)
        .then((encodedABI) => {         
            //let encodedABI = contract.methods.addInvoice(invoiceId, invoiceIdHash).encodeABI();
            const rawTransactionManager = quorumjs.RawTransactionManager(web3, {
                privateUrl:toPrivateURL,
                tlsSettings: tlsOptions
            });            
         
            let privateKey = '0x' + privateKeys[account];
            // console.log("encodedABI: ", encodedABI)

            const txnParams = {
                gasPrice: '0x746a528800',
                gasLimit: 4300000,
                to: "",
                value: 0,
                data: encodedABI,        
                isPrivate: true,
                from: {
                    privateKey: privateKey
                },
                privateFrom: fromPublicKey,
                privateFor: [toPublicKey],
                nonce: 0
            };
         
            web3.eth.getTransactionCount(account, 'pending').then((nonceToUse) => {
                console.log("Nonce :", nonceToUse);
                txnParams.nonce = nonceToUse;
                
                console.log(txnParams);
                const newTx = rawTransactionManager.sendRawTransaction(txnParams);
                newTx.then((txResult) => {
                    var deployedContractAddress = txResult.contractAddress;
                    console.log("Invoice deployed contract address: ", deployedContractAddress);
                    console.log("Tx Result Hash: ", txResult.transactionHash);
                    res.send({status: true, txResult: txResult});
                }).catch((err) => {
                    console.log("error");
                    console.log(err);
                    res.send({status: false});
                });
            });
        })
    })
})

module.exports = router;
