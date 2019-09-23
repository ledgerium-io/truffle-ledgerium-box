const {
    CONTRACT,
    PRIVATE_CONTRACT
} = require('../globalconfig');

const get = async (web3, contractDefinition) => {
    const deployedAddress = CONTRACT;

    console.log(`Dealing with Invoice Smart Contract Address: ${deployedAddress}`);

    // create the instance
    const instance = new web3.eth.Contract(
        contractDefinition.abi,
        deployedAddress
    )
    return instance
}

const getPrivate = async (web3, contractDefinition) => {
    const deployedAddress = PRIVATE_CONTRACT;
    console.log(`Dealing with Invoice Smart Contract Address: ${deployedAddress}`);
    // create the instance
    const instance = new web3.eth.Contract(
        contractDefinition.abi,
        deployedAddress
    )
    return instance
}

const getEncodedABI = async (contractDefinition, web3, constructorParameters) => {
    let contract = new web3.eth.Contract(contractDefinition.abi);
    return await contract.deploy({ data : contractDefinition.bytecode, arguments : constructorParameters}).encodeABI();
}

exports.get             = get;
exports.getPrivate      = getPrivate;
exports.getEncodedABI   = getEncodedABI;
