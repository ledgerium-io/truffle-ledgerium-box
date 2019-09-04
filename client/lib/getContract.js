const contract = require('../../server/src/globalconfig').CONTRACT;

const getContractInstance = async (web3, contractDefinition) => {
  const deployedAddress = contract;

  console.log('Deployed address: ', deployedAddress)

  // create the instance
  const instance = new web3.eth.Contract(
    contractDefinition.abi,
    deployedAddress
  )
  return instance
}
export default getContractInstance
