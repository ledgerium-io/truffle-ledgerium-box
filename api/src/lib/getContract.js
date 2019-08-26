const get = async (web3, contractDefinition) => {
    // get network ID and the deployed address
    console.log('hello came')
    const networkId = await web3.eth.net.getId()
    console.log('hello came')
    const deployedAddress = contractDefinition.networks[networkId].address
    // const deployedAddress = "0xf6499E3029c704A70dc6389dA71D60f544463469";
    console.log(deployedAddress);

    // create the instance
    const instance = new web3.eth.Contract(
        contractDefinition.abi,
        deployedAddress
    )
    return instance
}

exports.get = get
