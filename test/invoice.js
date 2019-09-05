const Web3 =  require('web3');
const Invoice = artifacts.require("Invoice");
const host = require("../truffle-config.js").networks.flinders.host;
const port = require("../truffle-config.js").networks.flinders.port;
const account = require("../truffle-config.js").networks.flinders.from;

contract("Invoice", accounts => {
  it("...should store the invoice with invoiceID 101", async () => {
    const invoiceInstance = await Invoice.deployed();

    let URL = 'http://' + host + ':' + port;
    let web3 = new Web3(new Web3.providers.HttpProvider(URL));
    web3.personal.unlockAccount(account,"password");
    
    //We are not using accounts of the node, given by the framework!
    const invoiceID = "102";
    const hashInvoice = "0xa0b644236540cdf";
    // add the invoice
    var transaction = await invoiceInstance.addInvoice(invoiceID, hashInvoice, { from: account });

    // verify if invoice exists
    const isInvoiceExists = await invoiceInstance.isHashExists(hashInvoice);
    console.log(`isInvoiceExists - ${isInvoiceExists}`)
    // verify if invoice exists
    if(isInvoiceExists) {
        const newInvoiceID = await invoiceInstance.getInvoiceID(hashInvoice);
        console.log(`newInvoiceID - ${newInvoiceID}`)
        assert.equal(newInvoiceID, invoiceID, "The invoice was not stored.");
    }    
  });
});
