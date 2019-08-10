import React, { Component } from 'react';
import Layout from '../components/layout/Layout'
import {
    Paper,    
    TextField,
    CircularProgress,
    ButtonBase
} from '@material-ui/core';
import getWeb3 from '../lib/getWeb3';
import getContract from '../lib/getContract';
import contractDefinition from '../lib/contracts/Invoice.json'
import '../styleSheets/public.css'
import crypto from 'crypto';

export default class Public extends Component {
    constructor() {
        super();
        this.state = {
            invoiceId: '',
            accounts: [],
            contract: ''
        }
    }

    async componentDidMount() {
        try {
            const web3 = await getWeb3();
            console.log('Web3: ', web3);
            
            let accounts = await web3.eth.getAccounts();
            console.log('Accounts: ', accounts);
            
            let contract = await getContract(web3, contractDefinition)
            console.log('contract', contract)
            
            this.setState({ 
                web3: web3, 
                accounts: accounts, 
                contract: contract 
            })            

        } catch {
            alert ('Failed to load Web3. Check console for details')
            console.log('Error: ', error);
        }

    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    }

    addInvoice = async (invoiceId) => {        
        console.log('Invoice ID: ',invoiceId);
        let invoiceIdHash = this.prepareHash(invoiceId)._v;
        console.log('Invoice ID Hash: ', invoiceIdHash);

        let txResult = await this.state.contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: this.state.accounts[0], gas:3000000 });
        console.log('Tx Result: ',txResult);
        // alert('Stored 5 into account')
    };

    prepareHash = async (invoiceId) => {
        return crypto.createHash('sha256').update(invoiceId).digest('hex');
    }

    handleSubmit = () => {
        if (this.state.invoiceId !== '') {
            this.addInvoice(this.state.invoiceId);
        } else {
            console.log('Invoice ID is missing');
        }
    }


    render() {
        return (
            <Layout>
                <div>
                    <Paper className="reqWidget">
                        <div className="widgetHeading">Add Invoice ID</div>
                        <table>
                            <tr>
                                <td>
                                    <TextField onChange={this.handleChange} type="text" name="invoiceId" label="Invoice ID" value={this.state.invoiceId}/>
                                </td>
                                <td>
                                    <ButtonBase size="small" onClick={this.handleSubmit} style={{backgroundColor: '#004681', color:'#ffffff', padding: '10px'}}>Submit</ButtonBase>
                                </td>
                            </tr>
                        </table>
                    </Paper>
                </div>
            </Layout>
        )
    }
}