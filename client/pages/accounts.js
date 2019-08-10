import React, {Component} from 'react';
import {Paper} from '@material-ui/core'
import getWeb3 from '../lib/getWeb3';
import Layout from '../components/layout/Layout';
import './../styleSheets/public.css';

export default class Accounts extends Component {
  constructor() {
    super();
    this.state = {
      accounts: [],
      markup: ''
    }
  }

  async componentDidMount() {
    try {
      const web3 = await getWeb3();
      console.log('web3: ', web3)
      
      let accounts = await web3.eth.getAccounts();
      console.log('Accounts: ', accounts)   
      
      const contract = await getContract(web3, contractDefinition)
      console.log('contract', contract)
      
      this.setState({
        web3: web3,
        accounts: accounts,
        contract: contract
      })      
    } catch {
      alert('Failed to load Web3. Check console for details')
      console.log(error)
    }
  }

  buildAccountsTable = (accounts) => {
    let rows=[];
    accounts.forEach(account => {
      rows.push(<tr>
        <td>{account}</td>
      </tr>)
    });
    let markup = <table>{rows}</table>
    console.log('markup', markup)
    return markup;
  }

  render() {    
    console.log('This.state.accounts: ', this.state.accounts)
    let markup = '';
    if (this.state.accounts.length > 0) {        
      markup = this.buildAccountsTable(this.state.accounts)      
    }
    return (
      <Layout>
        <div>
          <Paper className="reqWidget">
              <div className="widgetHeading">Accounts List</div>
              {markup}
          </Paper>
        </div>
      </Layout>
    )
  }
}



// const Accounts = ({ accounts }) => (
//   <div>
//     <h1>My Accounts</h1>
//     <pre>{JSON.stringify(accounts, null, 4)}</pre>
//     <div><Link href='/dapp'><a>My Dapp</a></Link></div>
//     <div><Link href='/'><a>Home</a></Link></div>
//   </div>
// )

// export default () => (
//   <Web3Container
//     renderLoading={() => <div>Loading Accounts Page...</div>}
//     render={({ accounts }) => <Accounts accounts={accounts} />}
//   />
// )


