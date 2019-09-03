pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Invoice.sol";

contract TestInvoice {
    function testItStoresAValue() public {
        Invoice invoice = Invoice(DeployedAddresses.Invoice());

        invoice.addInvoice("101","0xa0b6442334d0cdf");

        //uint expected = 101;
        //Assert.equal(invoice.getInvoiceID("0xa0b6442334d0cdf"), expected, "It should store the value 101.");
    }
}