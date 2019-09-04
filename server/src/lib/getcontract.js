const contract = require('../globalconfig').CONTRACT;

const get = async (web3, contractDefinition) => {
    const deployedAddress = contract;

    console.log(`Dealing with Invoice Smart Contract Address: ${deployedAddress}`);

    // create the instance
    const instance = new web3.eth.Contract(
        contractDefinition.abi,
        deployedAddress
    )
    return instance
}
exports.get = get
