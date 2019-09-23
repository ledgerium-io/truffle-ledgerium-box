'use strict';
const fs = require('fs');
const Web3 = require('web3');
const Utils =  require('./web3util');
const quorumjs   = require("quorum-js");
const sslCerts = require('./helpers/generatecerts')

var provider,fromPubKey,toPubKey;
var protocol,host,port,web3;
var subscribePastEventsFlag = false;
var webSocketProtocolFlag = false;
global.webSocketProtocolFlag = webSocketProtocolFlag;
global.subscribePastEventsFlag = subscribePastEventsFlag;

var web3;
global.web3 = web3;

const utils = new Utils();
global.utils = utils;

var URL;
var privateKey = {};
var accountAddressList = [];
var contractsList = {};
var usecontractconfigFlag = false;

global.contractsList = contractsList;

var main = async function () {

  const args = process.argv.slice(2);
  for (let i=0; i<args.length ; i++) {
      let temp = args[i].split("=");
      switch (temp[0]) {
            case "protocol":
                switch (temp[1]) {
                    case "ws":
                        protocol = "ws://";
                        global.protocol = protocol;
                        webSocketProtocolFlag = true;
                        global.webSocketProtocolFlag = webSocketProtocolFlag;
                        break;
                    case "http":
                    default:
                        protocol = "http://";
                        global.protocol = protocol;
                        webSocketProtocolFlag = false;
                        global.webSocketProtocolFlag = webSocketProtocolFlag;
                        break;
                }
                break;
            case "hostname":
                host = temp[1];
                global.host = host;
                break;
            case "port":
                port = temp[1];
                global.port = port;
                URL = "http://" + host + ":" + port;
                web3 = new Web3(new Web3.providers.HttpProvider(URL));
                global.web3 = web3;
                break;
            case "privateKeys":
                let prvKeys = temp[1].split(",");
                utils.createAccountsAndManageKeysFromPrivateKeys(prvKeys);
                utils.writeAccountsAndKeys();
                break;
            case "readkeyconfig":
                let readkeyconfig = temp[1];
                switch(readkeyconfig){
                    case "true":
                    default: 
                        utils.readAccountsAndKeys();
                        break;
                    case "false":
                        console.log("Given readkeyconfig option not supported! Provide correct details");
                        break;     
                }
                break;
            case "usecontractconfig":
                let contractconfig = temp[1];
                switch(contractconfig){
                    case "true":
                    default: 
                        usecontractconfigFlag = true;
                        break;
                    case "false":
                        break;     
                }
                break;
            case "rinkeby":
                accountAddressList = global.accountAddressList;
                privateKey = global.privateKey;
                let HDWalletProvider = require("truffle-hdwallet-provider");
                provider = new HDWalletProvider(privateKey[accountAddressList[0]], "https://rinkeby.infura.io/v3/931eac1d45254c16acc71d0fc11b88f0");
                web3 = new Web3();
                web3.setProvider(provider);
                global.web3 = web3;
                break;
            case "testgreeter":
                await testGreetingContract();
                break;
            case "testsimplestorage":
                await testSimpleStorageContract();
                break;
            case "fromPubKey":
                fromPubKey = temp[1];
                fromPubKey+="=";
                break;
            case "toPubKey":
                toPubKey = temp[1];
                toPubKey+="=";
                break;
            case "testSimpleStoragePrivate":
                {
                    let inputValues = temp[1].split(",");
                    if(inputValues.length > 6) {
                        await deploySimpleStoragePrivate(inputValues[0],inputValues[1],inputValues[2],inputValues[3],inputValues[4],inputValues[5],inputValues[6],inputValues[7]);
                    }    
                    break;
                }    
            case "testprivateTransactions": 
                {
                    let inputValues = temp[1].split(",");
                    if(inputValues.length > 6) {
                        await deployGreeterPrivate(inputValues[0],inputValues[1],inputValues[2],inputValues[3],inputValues[4],inputValues[5],inputValues[6],inputValues[7]);
                    }    
                    break;
                }    
            case "transactOnPrivateContract": 
                {
                    let inputValues = temp[1].split(",");
                    if(inputValues.length > 6) {
                        await setGreeterValues(inputValues[0],inputValues[1],inputValues[2],inputValues[3],inputValues[4],inputValues[5],inputValues[6],inputValues[7],inputValues[8]);
                    }    
                    break;
                }    
            case "testInvoices": {
                let list = temp[1].split(",");
                await testInvoicesContract(list[0],list[1]);
                break;
            }
            case "deployERC20Mock":
                await deployERC20MockContract();
                break;
            case "deployERC20":
                await deployERC20Contract();
                break;
            case "testLedgeriumToken":
                await testLedgeriumToken();
                break;
            case "testPersonalImportAccount": {
                let prvKeys = temp[1].split(",");
                let password = prvKeys.pop();
                await testPersonalImportAccount(prvKeys,password);
                break;
            }    
            case "transferXLG":
                let inputList = temp[1].split(",");
                await transferXLG(inputList[0],inputList[1],inputList[2]);
                break;
            case "synchPeers":
                await synchPeers();
                break;
            case "testNetworkManagerContract":
                let peerNodesfileName = temp[1];
                await testNetworkManagerContract(peerNodesfileName);
                break;
            case "testNewBlockEvent":
                await testNewBlockEvent(host,port);
                break;
            case "createprivatepubliccombo":
                let mnemonic = temp[1];
                await createprivatepubliccombo(mnemonic);
                break;
            case "generatetlscerts":
                generateCerts();
                break;
            default:
                //throw "command should be of form :\n node deploy.js host=<host> file=<file> contracts=<c1>,<c2> dir=<dir>";
                break;
      }
  }

  if(provider)
      provider.engine.stop();
  return;
}

main();

async function createprivatepubliccombo(mnemonic) {
    if(!mnemonic.length) {
        console.log("Invalid mnemonics. restart it")
        return; 
    }
    const ethUtils = require('ethereumjs-util');
    privateKey = '0x'+ethUtils.keccak(mnemonic).toString('hex');
    var publicKey = ethUtils.privateToPublic(privateKey).toString('hex');
    let ethAddress = ethUtils.privateToAddress(privateKey).toString('hex');

    console.log("mnemonics ", mnemonic, "\nprivateKey", privateKey, "\npublicKey", publicKey, "\nethAddress", ethAddress);
}

async function deployERC20MockContract() {

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;

    var ethAccountToUse = accountAddressList[0];
    
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/ERC20Mock";
    var value = utils.readSolidityContractJSON(filename);
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    
    var deployedERC20MockAddress;
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        constructorParameters.push(accountAddressList[0]);
        constructorParameters.push("2500");
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        //var deployedERC20MockAddress = "0x0000000000000000000000000000000000002020";
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedERC20MockAddress = transactionHash.contractAddress;
        console.log("ERC20Mock deployedAddress ", deployedERC20MockAddress);

        utils.writeContractsINConfig("ERC20Mock",deployedERC20MockAddress);
    }
    else{
        deployedERC20MockAddress = utils.readContractFromConfigContracts("ERC20Mock");
    }    
    
    var mock20ERC = new web3.eth.Contract(JSON.parse(value[0]),deployedERC20MockAddress);
    global.ERC20Mock = mock20ERC;

    //[1] - Total Supply
    var result = await mock20ERC.methods.totalSupply().call();
    console.log("totalSupply", result);

    //[2] - Balance of account which has tokens
    var result = await mock20ERC.methods.balanceOf(ethAccountToUse).call();
    console.log("balanceOf", result, "of account", ethAccountToUse);

    //[3] - Balance of account which doesnot have tokens
    var result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);
    
    //[4] - Transfer
    //[4.1] - When the recipient is the non zero address
    //[4.1.1] - When the sender doesnot have enough balance
    var encodedABI = mock20ERC.methods.transfer(accountAddressList[1],100).encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for ERC20Mock transfer without enough balance-", transactionObject.transactionHash);

    //[4.1.2]
    // var encodedABI = mock20ERC.methods.transfer(accountAddressList[1],123).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for ERC20Mock transfer with enough balance-", transactionObject.transactionHash);

    //[4.2] - When the recipient is the zero address
    var zeroAddress = '0x0000000000000000000000000000000000000000';
    // var encodedABI = mock20ERC.methods.transfer(zeroAddress,123).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for ERC20Mock transfer to zero address-", transactionObject.transactionHash);

    // result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    // console.log("balanceOf", result, "of account",  accountAddressList[1]);

    // result = await mock20ERC.methods.balanceOf(accountAddressList[0]).call();
    // console.log("balanceOf", result, "of account",  accountAddressList[0]);

    //[5] - Approve
    //[5.1] - When the spender is not the zero address
    //[5.1.1] - When the sender has enough balance
    // var encodedABI = mock20ERC.methods.approve(ethAccountToUse, 100).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var logs = await mock20ERC.getPastEvents('Approval');
    // console.log("TransactionLog for ERC20Mock approve ", JSON.stringify(logs));

    //[5.1.2] - When there was no approved amount before
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, ethAccountToUse).call();
    // console.log("When there was no approved amount before " + result)

    //[5.1.3] - When the spender has an approved amount
    // var encodedABI = mock20ERC.methods.approve(ethAccountToUse, 10).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, ethAccountToUse).call();
    // console.log("When there was approved amount (replaces the previous one) " + result)

    //[5.2] - When the sender doesnot have enough balance
    //[5.2.1]
    // var encodedABI = mock20ERC.methods.approve(ethAccountToUse, 5000).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var logs = await mock20ERC.getPastEvents('Approval');
    // /**?*/console.log("TransactionLog for ERC20Mock approve without enough balance ", JSON.stringify(logs));

    //[5.2.2] - When there was no approved amount before
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, ethAccountToUse).call();
    // console.log("Allowance - When there was no approved amount before " + result)

    //[5.2.3] - When the spender had an approved amount
    //Same as 5.1.3

    //[5.3] - When the spender is the zero address
    // var encodedABI = mock20ERC.methods.approve(zeroAddress, 100).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for ERC20Mock approve with zero address ", transactionObject.transactionHash);

    //[6] - Transfer from
    //[6.1] - When the recipient is not the zero address
    //[6.1.1] - When the spender has enough approved balance,
    //        - When the owner has enough balance

    //transferFrom not working

    // var encodedABI = mock20ERC.methods.approve(accountAddressList[1], 100).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[1]).call();
    // console.log("Allownace of ", accountAddressList[1], ' is ', result);

    // var encodedABI = mock20ERC.methods.transferFrom(accountAddressList[1], accountAddressList[2],100).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for ERC20Mock transferFrom ", transactionObject.transactionHash);
    // var balance1 = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    // var balance2 = await mock20ERC.methods.balanceOf(accountAddressList[2]).call();
    // console.log("After transferFrom, Balance of accountAddressList[1] ", accountAddressList[1], ' is ', balance1);
    // console.log("After transferFrom, Balance of accountAddressList[2] ", accountAddressList[2], ' is ', balance2);
    
    // var logs = await mock20ERC.getPastEvents('Transfer');
    // /**?*/console.log("TransactionLog for ERC20Mock approve without enough balance ", JSON.stringify(logs));

    //[6.1.2] - When the owner doesnot have enough balance
    // var encodedABI = mock20ERC.methods.transferFrom(accountAddressList[1], accountAddressList[2],101).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for ERC20Mock transferFrom without enough balance in owner", transactionObject.transactionHash);
    
    //[7] - Decrease allowance
    //[7.1] - When the spender is not the zero address
    //[7.1.1] - When there was no approved amount before
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    // console.log('Allowance (should be 0) ' + result)
    // var encodedABI = await mock20ERC.methods.decreaseAllowance(accountAddressList[2], 100).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for ERC20Mock decreaseAllowance without approved amount", transactionObject.transactionHash);

    //[7.1.2] - When the spender had an approved amount
    var encodedABI = mock20ERC.methods.approve(accountAddressList[2], 100).encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    console.log("Allownace of ", accountAddressList[2], ' is ', result);

    // var encodedABI = await mock20ERC.methods.decreaseAllowance(accountAddressList[2], 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    // var logs = await mock20ERC.getPastEvents('Approval')
    // console.log("Event log for ERC20Mock decreaseAllowance with approved amount", JSON.stringify(logs));
    // console.log('Allowance of ', accountAddressList[2], " after decreasing allowance is ", result )

    //[7.1.3] - Decrease the allowance subtracting the requested amount
    // var encodedABI = await mock20ERC.methods.decreaseAllowance(accountAddressList[2], 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    // var logs = await mock20ERC.getPastEvents('Approval')
    // console.log("Event log for ERC20Mock decreaseAllowance with approved amount", JSON.stringify(logs));
    // console.log('Allowance of ', accountAddressList[2], " after decreasing allowance is ", result )

    //[7.1.4] - Sets the allowance to zero when all allowance is removed
    // var encodedABI = await mock20ERC.methods.decreaseAllowance(accountAddressList[2], 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    // var logs = await mock20ERC.getPastEvents('Approval')
    // console.log("Event log for ERC20Mock decreaseAllowance with approved amount", JSON.stringify(logs));
    // console.log('Allowance of ', accountAddressList[2], " after decreasing full allowance is ", result )

    //[7.1.5] - Reverts when more than full allowance is removed
    // var encodedABI = await mock20ERC.methods.decreaseAllowance(accountAddressList[2], 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    // var logs = await mock20ERC.getPastEvents('Approval')
    // console.log("Event log for ERC20Mock decreaseAllowance with approved amount", JSON.stringify(logs));
    // console.log('Allowance of ', accountAddressList[2], " after decreasing more than full allowance is ", transactionObject.transactionHash )

    //[7.2] - When the spender is zero address
    // var encodedABI = await mock20ERC.methods.decreaseAllowance(zeroAddress, 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("Transaction log for ERC20Mock decreaseAllowance of zero address", transactionObject.transactionHash);
    
    //[8] - Increase Allowance
    //[8.1] - When the spender is not the zero address
    //[8.1.1] - When the sender has enough balance
    // var encodedABI = await mock20ERC.methods.increaseAllowance(accountAddressList[2], 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await mock20ERC.methods.allowance(ethAccountToUse, accountAddressList[2]).call();
    // var logs = await mock20ERC.getPastEvents('Approval')
    // console.log("Event log for ERC20Mock increaseAllowance with approved amount", JSON.stringify(logs));
    // console.log('Allowance of ', accountAddressList[2], " after increasing allowance is ", result )

    //[8.2] - When the spender is the zero address
    // var encodedABI = await mock20ERC.methods.increaseAllowance(zeroAddress, 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log('Transaction logs for ERC20Mock increaseAllowance of zero address ' + transactionObject.transactionHash)

    //[9] - Mint
    //[9.1] - Rejects a null account
    // var encodedABI = await mock20ERC.methods.mint(zeroAddress, 50).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log('Transaction logs for ERC20Mock mint for zero address ' + transactionObject.transactionHash)

    //[9.2] - Increments totalSupply
    // var encodedABI = await ERC20Mock.methods.mint(ethAccountToUse, 100).encodeABI();
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // var result = await ERC20Mock.methods.totalSupply().call();
    // console.log('Increment total Supply ' + result)
    // var result1 = await ERC20Mock.methods.balanceOf(ethAccountToUse).call();
    // /**? */console.log('Balance of ', ethAccountToUse, ' is ' , result1)
    // var logs = await ERC20Mock.getPastEvents('Transfer');
    // console.log('Transfer event after minting '+ JSON.stringify(logs))

    //[10] - burn
    //[10.1] - Rejects a null account
    // var encodedABI = await ERC20Mock.methods.burn(zeroAddress, 1);
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log('Transaction log for burn - zeroAddress ' + transactionObject.transactionHash)

    //[10.2] - For a non null account, rejects burning more than balance
    // var encodedABI = await ERC20Mock.methods.burn(ethAccountToUse, 1);
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // /**Not working - Invalid type */console.log('Transaction log for burning more than balance ' + transactionObject.transactionHash)

    //[11] - burnFrom
    //[11.1] - Rejects a null account
    // var encodedABI = await ERC20Mock.methods.burnFrom(zeroAddress, 1);
    // var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log('Transaction log for burnFrom - zeroAddress ' + transactionObject.transactionHash)
}

async function testGreetingContract() {
    
    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;  
  
    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/Greeter");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    var ethAccountToUse = accountAddressList[0];
    var deployedAddressGreeter;
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        constructorParameters.push("Hi Ledgerium");
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        //var deployedAddressGreeter = "0x0000000000000000000000000000000000002020";
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedAddressGreeter = transactionHash.contractAddress;
        console.log("Greeter deployedAddress ", deployedAddressGreeter);

        utils.writeContractsINConfig("Greeter",deployedAddressGreeter);
    }
    else{
        deployedAddressGreeter = utils.readContractFromConfigContracts("Greeter");
    }
    
    var greeting = new web3.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    global.greeting = greeting;
    
    var result = await greeting.methods.getMyNumber().call({from : ethAccountToUse});
    console.log("getMyNumber", result);
    
    let encodedABI = greeting.methods.setMyNumber(499).encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedAddressGreeter,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactioHash for Greeter Setvalue -", transactionObject.transactionHash);

    var val = await utils.decodeInputVals(transactionObject.transactionHash,value[0],web3);
    console.log("Input value for TransactioHash", transactionObject.transactionHash, "is", val.value);

    result = await greeting.methods.getMyNumber().call({from : ethAccountToUse});
    console.log("getMyNumber after", result);
}

async function testSimpleStorageContract() {
    
    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;  
  
    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/SimpleStorage");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    var ethAccountToUse = accountAddressList[0];
    var deployedAddressSimpleStorage;
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        constructorParameters.push(101);
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        //var deployedAddressSimpleStorage = "0x0000000000000000000000000000000000002020";
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedAddressSimpleStorage = transactionHash.contractAddress;
        console.log("SimpleStorage deployedAddress ", deployedAddressSimpleStorage);

        utils.writeContractsINConfig("SimpleStorage",deployedAddressSimpleStorage);
    }
    else{
        deployedAddressSimpleStorage = utils.readContractFromConfigContracts("SimpleStorage");
    }
    
    var simpleStorage = new web3.eth.Contract(JSON.parse(value[0]),deployedAddressSimpleStorage);
    global.simpleStorage = simpleStorage;
    
    var result = await simpleStorage.methods.get().call({from : ethAccountToUse});
    console.log("getMyNumber", result);
    
    let encodedABI = simpleStorage.methods.set(499).encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedAddressSimpleStorage,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactioHash for SimpleStorage set -", transactionObject.transactionHash);

    var val = await utils.decodeInputVals(transactionObject.transactionHash,value[0],web3);
    console.log("Input value for TransactioHash", transactionObject.transactionHash, ":");
    var bn;
    for(bn of val) {
        console.log(bn.toNumber());
    }     
    result = await simpleStorage.methods.get().call({from : ethAccountToUse});
    console.log("get after", result);
}

async function testInvoicesContract(invoiceID,hashVal) {
    
    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;  

    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/Invoice");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    var ethAccountToUse = accountAddressList[0];
    var deployedAddressInvoice = "0xf6499E3029c704A70dc6389dA71D60f544463469";
    
    var invoice = new web3.eth.Contract(JSON.parse(value[0]),deployedAddressInvoice);
    global.invoice = invoice;
    
    var result = await invoice.methods.isHashExists(hashVal).call({from : ethAccountToUse});
    console.log("isHashExists after", result);
    
    let encodedABI = invoice.methods.addInvoice(invoiceID,hashVal).encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedAddressInvoice,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for Invoice Setvalue -", transactionObject.transactionHash);

    result = await invoice.methods.isHashExists(hashVal).call({from : ethAccountToUse});
    console.log("isHashExists after", result);

    result = await invoice.methods.getInvoiceID(hashVal).call({from : ethAccountToUse});
    console.log("getInvoiceID after", result);
}

async function transferXLG(fromPrivateKey,toEthereumAccount,XLGAmount) {
    
    var transactionObject = "";
    if(fromPrivateKey.indexOf("0x") == 0) { //when privatekeys are prefixed 0x
        transactionObject = await utils.transferXLG(fromPrivateKey,toEthereumAccount,XLGAmount,web3);
        console.log("TransactionLog for transfer -", transactionObject.transactionHash);
    } else if(fromPrivateKey.indexOf("0x") == -1) { //when privatekeys are not prefixed 0x
        fromPrivateKey = "0x" + fromPrivateKey;
        transactionObject = await utils.transferXLG(fromPrivateKey,toEthereumAccount,XLGAmount,web3);
        console.log("TransactionLog for transfer -", transactionObject.transactionHash);
    } else {
        console.log("Wrong format private keys!!");
        process.exit(1);
    }
}

async function deployERC20Contract(){

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;

    var ethAccountToUse = accountAddressList[0];
    
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/ERC20";
    var value = utils.readSolidityContractJSON(filename);
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    
    var deployedERC20Address;
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        constructorParameters.push(accountAddressList[0]);
        constructorParameters.push("2500");
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        //var deployedERC20Address = "0x0000000000000000000000000000000000002020";
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedERC20Address = transactionHash.contractAddress;
        console.log("ERC20 deployedAddress ", deployedERC20Address);

        utils.writeContractsINConfig("ERC20",deployedERC20Address);
    }
    else{
        deployedERC20Address = utils.readContractFromConfigContracts("ERC20");
    }    
    
    var mock20ERC = new web3.eth.Contract(JSON.parse(value[0]),deployedERC20Address);
    global.ERC20 = mock20ERC;

    var result = await mock20ERC.methods.totalSupply().call();
    console.log("totalSupply", result);

    result = await mock20ERC.methods.balanceOf(ethAccountToUse).call();
    console.log("balanceOf", result, "of account", ethAccountToUse);

    result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);
    
    let encodedABI = mock20ERC.methods.transfer(accountAddressList[1],123).encodeABI();
    let transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20Address,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for ERC20 transfer -", transactionObject.transactionHash);

    result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);

    result = await mock20ERC.methods.balanceOf(accountAddressList[0]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[0]);
}

async function testLedgeriumToken(){

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;

    var ethAccountToUse = accountAddressList[0];
    
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/LedgeriumToken";
    var value = utils.readSolidityContractJSON(filename);
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }

    var deployedLedgeriumTokenAddress,deployedMultiSigWalletAddress;
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedLedgeriumTokenAddress = transactionHash.contractAddress;
        console.log("LedgeriumToken deployedAddress ", deployedLedgeriumTokenAddress);
    }
    else {
        deployedLedgeriumTokenAddress = utils.readContractFromConfigContracts("LedgeriumToken");
    }   

    var ledgeriumToken = new web3.eth.Contract(JSON.parse(value[0]),deployedLedgeriumTokenAddress);
    global.ledgeriumToken = ledgeriumToken;

    var result = await ledgeriumToken.methods.totalSupply().call();
    console.log("totalSupply", result);

    result = await ledgeriumToken.methods.symbol().call();
    console.log("symbol", result);

    result = await ledgeriumToken.methods.decimals().call();
    console.log("decimals", result);

    result = await ledgeriumToken.methods.balanceOf(ethAccountToUse).call();
    console.log("balanceOf", result, "of account", ethAccountToUse);

    result = await ledgeriumToken.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);
    
    let encodedABI = ledgeriumToken.methods.transfer(accountAddressList[1],123).encodeABI();
    let transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedLedgeriumTokenAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for ledgeriumToken transfer -", transactionObject.transactionHash);

    result = await ledgeriumToken.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);

    result = await ledgeriumToken.methods.balanceOf(accountAddressList[0]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[0]);

    filename = __dirname + "/build/contracts/MultiSigWallet";
    value = utils.readSolidityContractJSON(filename);
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    
    var multiSigContract = new web3.eth.Contract(JSON.parse(value[0]),deployedLedgeriumTokenAddress);
    global.multiSigContract = multiSigContract;

    if(!usecontractconfigFlag){
        let constructorParameters = [];
        constructorParameters.push([accountAddressList[0],accountAddressList[1],accountAddressList[2]]);
        constructorParameters.push(2);
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedMultiSigWalletAddress = transactionHash.contractAddress;
        console.log("MultiSigWallet deployedAddress ", deployedMultiSigWalletAddress);

        utils.writeContractsINConfig("LedgeriumToken",deployedLedgeriumTokenAddress);
        utils.writeContractsINConfig("MultiSigWallet",deployedMultiSigWalletAddress);
    }
    else{
        deployedMultiSigWalletAddress = utils.readContractFromConfigContracts("MultiSigWallet");
    }
    // encodedABI = ledgeriumToken.methods.init([accountAddressList[0], accountAddressList[1], accountAddressList[2]], 2).encodeABI();
    // transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedLedgeriumTokenAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    // console.log("TransactionLog for multiSigContract transfer -", transactionObject.transactionHash);
}

async function testPersonalImportAccount(inputPrivateKeys, password) {

    if(inputPrivateKeys.length <= 0)
        return;
  
    var ethereumAccountsList = await web3.eth.getAccounts();
    console.log("No of Ethereum accounts on the node ",ethereumAccountsList.length);

    for(var index = 0; index < inputPrivateKeys.length; index++)
    {
        let flag = false;
        let eachElement = inputPrivateKeys[index];
        if(eachElement.indexOf("0x") == 0) { //when privatekeys are prefixed 0x
            flag = true;
        } else if(eachElement.indexOf("0x") == -1) { //when privatekeys are not prefixed 0x
            eachElement = "0x" + eachElement;
            flag = true;
        } else {
            console.log("Wrong format private key!!, This key will not be considered");
        }
        if(!flag)
            continue;
        let fromAccountAddress = await web3.eth.accounts.privateKeyToAccount(eachElement).address;
        //ethereum gives back mixed case account address, we need to lowercase each of them before comparing! Have to run the loop. 
        let found = false;
        for (let item of ethereumAccountsList) {
            if(item.toLowerCase() == fromAccountAddress.toLowerCase()) {
                found = true;
                break;
            }
        }
        if(found){
            found = false;
            continue;
        }
        let ret = await utils.personalImportAccount(eachElement,password);
        console.log("Account", ret, "got imported!");
        var balance = await web3.eth.getBalance(ret);
        console.log("FromAccount", ret, "has balance of", web3.utils.fromWei(balance, 'xlg'), "xlg");
    }
}

async function testNetworkManagerContract(peerNodesfileName) {

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;  
  
    var ethereumAccountsList = await web3.eth.getAccounts();
    console.log("No of Ethereum accounts on the node ",ethereumAccountsList.length);
    var ethAccountToUse = accountAddressList[0];

    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/NetworkManagerContract";
    var value = utils.readSolidityContractJSON(filename);
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }

    var networkManagerAddress = "";
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1], web3, constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3, 0);
        networkManagerAddress = transactionHash.contractAddress;
        console.log("NetworkManager deployedAddress ", networkManagerAddress);
        utils.writeContractsINConfig("NetworkManager",networkManagerAddress);
    }
    else{
        networkManagerAddress = utils.readContractFromConfigContracts("NetworkManager");
    }
    
    // let constructorParameters = [];
    // let encodedABIdeployedContract = await utils.getContractEncodeABI(value[0], value[1], web3, constructorParameters);
    // let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABIdeployedContract,privateKey[ethAccountToUse],web3,0);
    // var networkManagerAddress = transactionHash.contractAddress;
    // //var networkManagerAddress = "0x0000000000000000000000000000000000002023";
    // console.log("networkManagerAddress deployedAddress ", networkManagerAddress);

    var nmContract = new web3.eth.Contract(JSON.parse(value[0]),networkManagerAddress);
    let encodedABI = nmContract.methods.init().encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,networkManagerAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for Network Manager init() method -", transactionObject.transactionHash);
  
    var peerNodejson = JSON.parse(fs.readFileSync(peerNodesfileName, 'utf8'));
    if(peerNodejson == "") {    
        return;
    }

    var peerNodes = peerNodejson["nodes"];
    for(var index = 0; index < peerNodes.length; index++){
        encodedABI = nmContract.methods.registerNode(peerNodes[index].nodename,
                                                    peerNodes[index].hostname,
                                                    peerNodes[index].role,
                                                    peerNodes[index].ipaddress,
                                                    peerNodes[index].port.toString(),
                                                    peerNodes[index].publickey,
                                                    peerNodes[index].enodeUrl
                                                ).encodeABI();
        transactionObject = await utils.sendMethodTransaction(ethAccountToUse,networkManagerAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
        console.log("TransactionLog for Network Manager registerNode -", transactionObject.transactionHash);

        var val = await utils.decodeInputVals(transactionObject.transactionHash,value[0],web3);
        if(val.length >0)
            console.log("Input values for TransactioHash", transactionObject.transactionHash, "are", val[0],val[1],val[2],val[3],val[4],val[5],val[6]);
        else
            console.log("Input values for TransactioHash", transactionObject.transactionHash, "are not available!");    
    }

    var noOfNodes = await nmContract.methods.getNodesCounter().call();
    console.log("No of Nodes -", noOfNodes);
    for(let nodeIndex = 0; nodeIndex < noOfNodes; nodeIndex++) {
        let result = await nmContract.methods.getNodeDetails(nodeIndex).call();
        console.log("Details of peer index-", nodeIndex);
        console.log("HostName ", result.hostName,"\nRole ", result.role, "\nIP Address ", result.ipAddress, "\nPort ", result.port, "\nPublic Key ", result.publicKey, "\nEnode ", result.enode);
    }
    return;
}

async function testNewBlockEvent(host, port) {

    const h1 = protocol + host + ":" + port;
    const web32 = new Web3(new Web3.providers.WebsocketProvider(h1));
    web32.eth.subscribe('newBlockHeaders', function(error, result){
        if (!error) {
            console.log(result);
            process.exit(0)
            return;
        }
        console.error(error);
    })
    // .on("data", function(blockHeader){
    //     console.log(blockHeader);
    // })
    // .on("error", console.error);
    return;
}

async function synchPeers() {

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;

    var ethAccountToUse = global.accountAddressList[0];

    const RLP = require('rlp');
    //const mixDigestBuffer = Buffer.from([99, 116, 105, 99, 97, 108, 32, 98, 121, 122, 97, 110, 116, 105, 110, 101, 32, 102, 97, 117, 108, 116, 32, 116, 111, 108, 101, 114, 97, 110, 99, 101]);
    const myString = "ctical byzantine fault tolerance"
    console.log("String", myString);
    console.log("HEX String", myString.toString("hex"));
    const myStringEncodedBuffer = RLP.encode(myString.toString("hex"));
    console.log("myStringEncodedBuffer String", myStringEncodedBuffer);
    console.log("The length of myStringEncodedBuffer",myStringEncodedBuffer.length);
    const myStringDecodedLongString = RLP.decode(myStringEncodedBuffer);
    console.log("Buffered Decoded String", myStringDecodedLongString);
    console.log("The length of myStringDecodedLongString",myStringEncodedBuffer.length);
    console.log("UTF String", myStringEncodedBuffer.toString('utf8'));
    console.log("HEX String", myStringEncodedBuffer.toString('hex'));

    const mixDigestBuffer = RLP.encode("0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365");
    console.log("encoded Buffer", mixDigestBuffer);
    console.log("The length",mixDigestBuffer.length);
    const decodedLongString = RLP.decode(mixDigestBuffer);
    console.log("Buffered String", decodedLongString);
    console.log("UTF String", decodedLongString.toString('utf8'));
    console.log("HEX String", decodedLongString.toString('hex'));

    try {
        const ethUtils = require('ethereumjs-util');
        var privkey = new Buffer("4646464646464646464646464646464646464646464646464646464646464646");
        var signingdata = "0xec098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a764000080018080";
        var signingHash = ethUtils.sha3(signingdata);
        //var pubkey = ethUtils.ecrecover(data, vrs.v, vrs.r, vrs.s);
        var vrs = ethUtils.ecsign(signingHash, privkey);
        console.log("vrs.v, vrs.r, vrs.s", vrs.v, vrs.r, vrs.s);
    } catch (exception) {
        console.log(`${exception}`)
    }    

    // var privkey = new Buffer(privateKey[ethAccountToUse], 'hex');
    // var data = ethUtils.sha3('Hello world');
    // var vrs = ethUtils.ecsign(data, privkey);
    // var pubkey = ethUtils.ecrecover(data, vrs.v, vrs.r, vrs.s);
    // var abcd = ethUtils.publicToAddress(pubkey).toString('hex');
    // console.log("signedTran", vrs.r.toString('hex'), "ethAccountToUse", ethAccountToUse, "\npubkey", abcd);

    var nodesList = await utils.getAdminPeers(URL);
    
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/NetworkManagerContract";
    var value = utils.readSolidityContractJSON(filename);
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }

    var networkManagerAddress = "";
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1], web3, constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3, 0);
        networkManagerAddress = transactionHash.contractAddress;
        console.log("NetworkManager deployedAddress ", networkManagerAddress);
        utils.writeContractsINConfig("NetworkManager",networkManagerAddress);
    }
    else{
        networkManagerAddress = utils.readContractFromConfigContracts("NetworkManager");
        if(networkManagerAddress == "")
            networkManagerAddress = "0x0000000000000000000000000000000000002023";
    }
    
    var nmContract = new web3.eth.Contract(JSON.parse(value[0]),networkManagerAddress);
    var nodesListBlockchain = [];
    var noOfNodes = await nmContract.methods.getNodesCounter().call();
    console.log("No of Nodes -", noOfNodes);
    for(let nodeIndex = 0; nodeIndex < noOfNodes; nodeIndex++) {
        let result = await nmContract.methods.getNodeDetails(nodeIndex).call();
        nodesListBlockchain.push(result);
    }
    
    for(var index = 0; index < nodesList.length; index++) {
        let flag = false;
        for(let nodeIndex = 0; nodeIndex < noOfNodes; nodeIndex++) { 
            var nodeBlockChain = nodesListBlockchain[nodeIndex];
            if (nodesList[index].enode == nodeBlockChain.enode) {
                flag = true;
                break;
            }
        }
        if(!flag) {
            let encodedABI = nmContract.methods.registerNode(nodesList[index].hostname,
                nodesList[index].hostname,
                nodesList[index].role,
                nodesList[index].ipaddress,
                nodesList[index].port,
                nodesList[index].publickey,
                nodesList[index].enode
            ).encodeABI();
            var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,networkManagerAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
            console.log("TransactionLog for adding peer", nodesList[index].enode, "Network Manager registerNode -", transactionObject.transactionHash);
        }
    }
    return;
}

var web31,web32,web33,web34;
async function deployGreeterPrivate(host1, host2, host3, host4, toPrivatePort, toPort1, otherPort1, otherPort2) {
    console.log(`${fromPubKey}`);
    console.log(`${toPubKey}`);
    const h1 = "http://" + host1 + ":" + port;
    const h2 = "http://" + host2 + ":" + toPort1;
    const h3 = "http://" + host3 + ":" + otherPort1;
    const h4 = "http://" + host4 + ":" + otherPort2;
    const toPrivateURL = "https://" + host + ":" + toPrivatePort;

    console.log("Host: ", h1)
    web31 = new Web3(new Web3.providers.HttpProvider(h1));
    web32 = new Web3(new Web3.providers.HttpProvider(h2));
    web33 = new Web3(new Web3.providers.HttpProvider(h3));
    web34 = new Web3(new Web3.providers.HttpProvider(h4));

    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/Greeter");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    var ethAccountToUse = global.accountAddressList[0];
    var deployedAddressGreeter;

    let constructorParameters = [];
    constructorParameters.push("Hi Ledgerium");

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

    //value[0] = Contract ABI and value[1] =  Contract Bytecode
    let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web31,constructorParameters);
    const rawTransactionManager = quorumjs.RawTransactionManager(web31, {
        privateUrl:toPrivateURL,
        tlsSettings: tlsOptions
    });
    var abcd = '0x' + global.privateKey[ethAccountToUse];
    var gasPrice = await web3.eth.getGasPrice();
    const txnParams = {
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: 4300000,
        to: "",
        value: 0,
        data: encodedABI,        
        isPrivate: true,
        from: {
            privateKey: abcd
        },
        privateFrom: fromPubKey,
        privateFor: [toPubKey],
        nonce: 0
    };
    web31.eth.getTransactionCount(ethAccountToUse, 'pending', (err, nonce) => {
        txnParams.nonce = nonce;
        console.log("Nonce :", nonce);
        const newTx = rawTransactionManager.sendRawTransaction(txnParams);
        newTx.then(function (tx){
            deployedAddressGreeter = tx.contractAddress;
            console.log("Greeter deployed contract address: ", deployedAddressGreeter);
            console.log("Greeter deployed transactionHash: ", tx.transactionHash);
            utils.writeContractsINConfig("Greeter",deployedAddressGreeter);
            getGreeterValues(deployedAddressGreeter);
            //setGreeterValues(deployedAddressGreeter,host1, host2, host3, host4, toPrivatePort, toPort1, otherPort1, otherPort2);
        }).catch(function (err) {
            if(err.error.code === 'HPE_INVALID_CONSTANT') {
                    console.log('Server returned no headers. Does server accept https request?')                      
            }
                if(err.error.code === 'EPROTO') {
                console.log('Certificate Error. Verify if the certificate is valid and not regenerated with same subject Info ')
            }
            console.log(err);
        });
    });
}

async function setGreeterValues(host1, host2, host3, host4, toPrivatePort, toPort1, otherPort1, otherPort2, deployedAddressGreeter) {

    if(!usecontractconfigFlag && !deployedAddressGreeter) {
        deployGreeterPrivate(host1, host2, host3, host4, toPrivatePort, toPort1, otherPort1, otherPort2);
        deployedAddressGreeter = utils.readContractFromConfigContracts("Greeter");
        if(deployedAddressGreeter == "") {
            console.log("deployedAddressGreeter is undefined in contracts config")
            return;
        }
    }
    
    console.log(`${fromPubKey}`);
    console.log(`${toPubKey}`);
    const h1 = "http://" + host1 + ":" + port;
    const h2 = "http://" + host2 + ":" + toPort1;
    const h3 = "http://" + host3 + ":" + otherPort1;
    const h4 = "http://" + host4 + ":" + otherPort2;
    const toPrivateURL = "http://" + host + ":" + toPrivatePort;
    
    web31 = new Web3(new Web3.providers.HttpProvider(h1));
    web32 = new Web3(new Web3.providers.HttpProvider(h2));
    web33 = new Web3(new Web3.providers.HttpProvider(h3));
    web34 = new Web3(new Web3.providers.HttpProvider(h4));    
    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/Greeter");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    
    const contract1 = new web31.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    // const contract2 = new web32.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    // const contract3 = new web33.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    // const contract4 = new web34.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);

    var ethAccountToUse = global.accountAddressList[0];
    var encodedABI = contract1.methods.setMyNumber(316).encodeABI();
    
    let tlsOptions = {
        key: fs.readFileSync('./certs/cert.key'),
        clcert: fs.readFileSync('./certs/cert.pem'),
        allowInsecure: true
    }  

    //value[0] = Contract ABI and value[1] =  Contract Bytecode
    const rawTransactionManager = quorumjs.RawTransactionManager(web31, {
        privateUrl:toPrivateURL,
        tlsSettings: tlsOptions
    });
    var abcd = '0x' + global.privateKey[ethAccountToUse];
    var gasPrice = await web3.eth.getGasPrice();
    const txnParams = {
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: 4300000,
        to: deployedAddressGreeter,
        value: 0,
        data: encodedABI,        
        isPrivate: true,
        from: {
            privateKey: abcd
        },
        privateFrom: fromPubKey,
        privateFor: [toPubKey],
        nonce: 0
    };
    let nonceToUse = await web3.eth.getTransactionCount(ethAccountToUse, 'pending');
    console.log("Nonce :", nonceToUse);
    txnParams.nonce = nonceToUse;
    const newTx = rawTransactionManager.sendRawTransaction(txnParams);
    newTx.then(function (tx){
        console.log("Greeter setMyNumber transactionHash: ", tx.transactionHash);
        getGreeterValues(deployedAddressGreeter);
    }).catch(function (err) {
        console.log("error");
        console.log(err);
    });
}

async function getGreeterValues(deployedAddressGreeter) {
    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/Greeter");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    
    const contract1 = new web31.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    const contract2 = new web32.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    const contract3 = new web33.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
    const contract4 = new web34.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);

    // contract1.methods.getMyNumber().call().then(console.log).catch((err)=>{console.log("err 1")});
    // contract2.methods.getMyNumber().call().then(console.log).catch((err)=>{console.log("err 2")});
    // contract3.methods.getMyNumber().call().then(console.log).catch((err)=>{console.log("err 3")});
    // contract4.methods.getMyNumber().call().then(console.log).catch((err)=>{console.log("err 4")});
    
    contract1.methods.getMyNumber().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 1",error);
        }
    }).catch(err => {
        console.log(err.message + ' Is this a private transaction?')
    });

    contract2.methods.getMyNumber().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 2",error);
        }
    }).catch(err => {
        console.log(err.message + ' Is this a private transaction?')
    });

    contract3.methods.getMyNumber().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 3",error);
        }
    }).catch(err => {
        console.log(err.message + ' Is this a private transaction?')
    });

    contract4.methods.getMyNumber().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 4",error);
        }
    }).catch(err => {
        console.log(err.message + ' Is this a private transaction?')
    });
}

async function deploySimpleStoragePrivate(host1, host2, host3, host4, toPrivatePort, toPort1, otherPort1, otherPort2) {
    console.log(`${fromPubKey}`);
    console.log(`${toPubKey}`);
    
    const h1 = "http://" + host1 + ":" + port;
    const h2 = "http://" + host2 + ":" + toPort1;
    const h3 = "http://" + host3 + ":" + otherPort1;
    const h4 = "http://" + host4 + ":" + otherPort2;
    const toPrivateURL = "http://" + host1 + ":" + toPrivatePort;

    web31 = new Web3(new Web3.providers.HttpProvider(h1));
    web32 = new Web3(new Web3.providers.HttpProvider(h2));
    web33 = new Web3(new Web3.providers.HttpProvider(h3));
    web34 = new Web3(new Web3.providers.HttpProvider(h4));

    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/SimpleStorage");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    var ethAccountToUse = global.accountAddressList[0];
    var deployedAddressSimpleStorage;

    let constructorParameters = [];
    constructorParameters.push(123);
    //value[0] = Contract ABI and value[1] =  Contract Bytecode
    let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web31,constructorParameters);
    const rawTransactionManager = quorumjs.RawTransactionManager(web31, {
        privateUrl:toPrivateURL
    });
    var abcd = '0x' + global.privateKey[ethAccountToUse];
    const txnParams = {
        gasPrice: 0,
        gasLimit: 4300000,
        to: "",
        value: 0,
        data: encodedABI,        
        isPrivate: true,
        from: {
            privateKey: abcd
        },
        privateFrom: fromPubKey,
        privateFor: [toPubKey],
        nonce: 0
    };
    web31.eth.getTransactionCount(ethAccountToUse, 'pending', (err, nonce) => {
        txnParams.nonce = nonce;
        console.log("Nonce :", nonce);
        const newTx = rawTransactionManager.sendRawTransaction(txnParams);
        newTx.then(function (tx){
            deployedAddressSimpleStorage = tx.contractAddress;
            console.log("SimpleStorage deployed contract address: ", deployedAddressSimpleStorage);
            console.log("SimpleStorage deployed transactionHash: ", tx.transactionHash);
            utils.writeContractsINConfig("SimpleStorage",deployedAddressSimpleStorage);
            getSimpleStorageValues(deployedAddressSimpleStorage);
        }).catch(function (err) {
            console.log("error");
            console.log(err);
        });
    });
}

async function getSimpleStorageValues(deployedAddressSimpleStorage) {
    // Todo: Read ABI from dynamic source.
    var value = utils.readSolidityContractJSON("./build/contracts/SimpleStorage");
    if((value.length <= 0) || (value[0] == "") || (value[1] == "")) {
        return;
    }
    
    const contract1 = new web31.eth.Contract(JSON.parse(value[0]),deployedAddressSimpleStorage);
    const contract2 = new web32.eth.Contract(JSON.parse(value[0]),deployedAddressSimpleStorage);
    const contract3 = new web33.eth.Contract(JSON.parse(value[0]),deployedAddressSimpleStorage);
    const contract4 = new web34.eth.Contract(JSON.parse(value[0]),deployedAddressSimpleStorage);
    contract1.methods.get().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 1",error);
        }
    });
    contract2.methods.get().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 2",error);
        }
    });
    contract3.methods.get().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 3",error);
        }
    });
    contract4.methods.get().call().then(function (val, error) {
        if(!error)
            console.log(val);
        else {
            console.log("error 4",error);
        }
    });
}

function generateCerts() {
    sslCerts.generateTLSCerts()
}