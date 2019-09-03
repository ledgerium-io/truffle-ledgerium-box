const Invoice = artifacts.require("Invoice");

contract("Invoice", accounts => {
  it("...should store the invoice with invoiceID 101", async () => {
    const invoiceInstance = await Invoice.deployed();

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
