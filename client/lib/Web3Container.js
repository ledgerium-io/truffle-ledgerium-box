import React from 'react'
import getWeb3 from './getweb3'
import getContract from './getcontract'
import contractDefinition from './contracts/simplestorage.json'

export default class Web3Container extends React.Component {
  state = { web3: null, accounts: null, contract: null };

  async componentDidMount () {
    try {
      const web3 = await getWeb3()
      console.log('web3', web3)
      const accounts = await web3.eth.getAccounts()
      console.log('Hello', accounts)
      const contract = await getContract(web3, contractDefinition)
      console.log('contract', contract)
      this.setState({ web3, accounts, contract })
      // console.log('contract', contract)
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      console.log(error)
    }
  }

  render () {
    const { web3, accounts, contract } = this.state
    return web3 && accounts
      ? this.props.render({ web3, accounts, contract })
      : this.props.renderLoading()
  }
}
