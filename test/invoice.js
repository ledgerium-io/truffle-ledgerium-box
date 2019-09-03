const Web3 =  require('web3');
const Invoice = artifacts.require("Invoice");
const host = require("../truffle-config.js").networks.flinders.host;
const port = require("../truffle-config.js").networks.flinders.port;
const account = require("../truffle-config.js").networks.flinders.from;

contract("Invoice", accounts => {
  it("...should store the invoice with invoiceID 101", async () => {
    const invoiceInstance = await Invoice.deployed();

    let URL = 'http://' + host + ':' + port;
    console.log("Going to connect to ", URL);
    let web3 = new Web3(new Web3.providers.HttpProvider(URL));
    web3.personal.unlockAccount(account,"password")
    
    const invoiceID = "101";
    const hashInvoice = "0xa0b6442334d0cdf";
    // add the invoice
    await invoiceInstance.addInvoice(invoiceID, hashInvoice, { from: accounts[0] });

    // verify if invoice exists
    const isInvoiceExists = await invoiceInstance.isHashExists(hashInvoice).call({from : accounts[0]});

    // verify if invoice exists
    if(isInvoiceExists) {
        const newInvoiceID = await invoiceInstance.getInvoiceID(hashInvoice).call({from : accounts[0]});
        assert.equal(newInvoiceID, invoiceID, "The invoice was not stored.");
    }    
  });
});
