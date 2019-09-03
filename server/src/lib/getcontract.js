const get = async (web3, contractDefinition) => {
    // get network ID and the deployed address
    const networkId = await web3.eth.net.getId()
    // const deployedAddress = contractDefinition.networks[networkId].address
    //const deployedAddress = "0x0000000000000000000000000000000000002020";
    const deployedAddress = "0xBeA37B161d94b2c3140376E264929BC21B0A1518";

    console.log(`Dealing with Invoice Smart Contract Address: ${deployedAddress}`);

    // create the instance
    const instance = new web3.eth.Contract(
        contractDefinition.abi,
        deployedAddress
    )
    return instance
}
exports.get = get
