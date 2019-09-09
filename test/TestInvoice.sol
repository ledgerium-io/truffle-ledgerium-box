pragma solidity ^0.5.0;

import "truffle/AssertString.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Invoice.sol";

contract TestInvoice {
    constructor() public {
        Invoice invoice = Invoice(DeployedAddresses.Invoice());

        invoice.addInvoice("102","0xa0c7442334d0cdf");

        string memory expected = "102";
        AssertString.equal(invoice.getInvoiceID("0xa0c7442334d0cdf"), expected, "It should store the value 102.");
    }
}