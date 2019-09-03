const Promise = require("bluebird");
const sequentialPromise = require("./sequentialpromise.js");

/**
 * @param {!string | !Array.<!string>} txHash, a transaction hash or an array of transaction hashes.
 * @param {Number} interval, in seconds.
 * @returns {!Promise.<!object> | !Promise.<!Array.<!object>>} the receipt or an array of receipts.
 */
module.exports = function getTransactionReceiptMined(txHash, interval) {
    const self = this;
    const transactionReceiptRetry = () => self.getTransactionReceipt(txHash)
        .then(receipt => receipt != null
            ? receipt
            : Promise.delay(interval ? interval : 500).then(transactionReceiptRetry));
    if (Array.isArray(txHash)) {
        return sequentialPromise(txHash.map(
            oneTxHash => () => self.getTransactionReceiptMined(oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return transactionReceiptRetry();
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
};