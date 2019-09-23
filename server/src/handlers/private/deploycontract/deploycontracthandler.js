const express           = require('express');
const quorumjs          = require('quorum-xlg-js')
const fs                = require('fs');
const getWeb3           = require('../../../lib/getweb3');
const getContract       = require('../../../lib/getcontract');
const contractDef       = require('./../../../lib/contracts/Invoice.json');
const privateKeys       = require('./../../../keystroe/privatekey.json')
const {
    CONTRACT        
} = require('../../../globalconfig')

const router        = express.Router();

router.post('/', (req, res) => {
    let fromPublicKey       = req.body.fromPublicKey;
    let toPublicKey         = req.body.toPublicKey;
    let fromHost            = req.body.fromHost;
    let toHost              = req.body.toHost;
    let fromPort            = req.body.fromPort;
    let toPort              = req.body.toPort;
    let account             = req.body.account;

    let fromHostAddr        = `http://${fromHost}:${fromPort}`;
    let toHostAddr          = `https://${toHost}:${toPort}`;

    let tlsOptions;

    try {
         tlsOptions = {
            key: fs.readFileSync('./certs/cert.key'),
            clcert: fs.readFileSync('./certs/cert.pem'),
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
    let constructorParameters = [];
    getWeb3.getHttp(fromHostAddr)
    .then((web3) => {
        getContract.getEncodedABI(contractDef, web3, constructorParameters)
        .then((encodedABI) => {
         
            console.log("encodedABI: ", encodedABI)
            const rawTransactionManager = quorumjs.RawTransactionManager(web3, {
                privateUrl:toHostAddr,
                tlsSettings: tlsOptions
            });            
         
            let privateKey = '0x' + privateKeys[account];

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
                    deployedAddressGreeter = txResult.contractAddress;
                    console.log("Deployed contract address: ", deployedAddressGreeter);
                    console.log("Deployed transactionHash: ", txResult.transactionHash);
                    res.send({status: true, txResult: txResult});
                }).catch((err) => {
                    console.log(err);
                    res.send({status: false});
                });
            });
        })
    })
})

module.exports = router;
