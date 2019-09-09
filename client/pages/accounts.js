import React, {Component} from 'react';
import {Paper} from '@material-ui/core'
import Layout from '../components/layout/layout';
import './../stylesheets/public.css';
import axios from 'axios';

export default class Accounts extends Component {
  constructor() {
    super();
    this.state = {
      accounts: [],
      markup: ''
    }
  }

  async componentDidMount() {
    axios.post('http://localhost:9086/getaccounts', {})
    .then ((result) => {
      console.log('Result: ', result.data.accounts);
      this.setState({accounts: result.data.accounts});
    })
  }
h
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


