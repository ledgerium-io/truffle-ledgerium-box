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
import axios from 'axios';

export default class Public extends Component {
    constructor() {
        super();
        this.state = {
            invoiceId: '',
            invoiceIdHash: '',
            verifyInvoiceIdHash: '',
            getInvoiceIdHash: '',
            accounts: [],
            contract: '',
            submitCircularProgress: false,
            verifyCircularProgress: false,
            getInvoiceIdCircularProgress: false
        }
    }

    async componentDidMount() {
        try {
            const web3 = await getWeb3();
            //console.log('Web3: ', web3);    
            
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
    
    handleSubmit = async () => {
        if (this.state.invoiceId !== '' && this.state.invoiceIdHash !== '') {
            this.setState({submitCircularProgress: true})            
            this.state.contract.methods.addInvoice(this.state.invoiceId, this.state.invoiceIdHash).send({ from: this.state.accounts[0], gas:300000 }, (err, txHash) => {
                this.state.web3.eth.getTransactionReceiptMined(txHash).then((txResult) => {
                    console.log("Tx Result: ", txResult)                    
                    if (txResult.status) {
                        this.setState({invoiceId: '', invoiceIdHash: '', submitCircularProgress: false});
                        alert(`Sucessfully added Invoice ID!`)
                    } else {
                        this.setState({submitCircularProgress: false});
                        alert('Failed to add Invoice ID!')
                    }            
                })
            })                                                                
        } else {
            alert('Missing Invoice ID or Invoice ID hash')
            console.log('Invoice ID is missing');
        }
    }
    
    handleIsHashExists = async () => {
        if (this.state.verifyInvoiceIdHash !== '') {
            this.setState({verifyCircularProgress: true})
            let txResult = await this.state.contract.methods.isHashExists(this.state.verifyInvoiceIdHash).call({ from: this.state.accounts[0]  })
            if (txResult) {
                this.setState({verifyInvoiceIdHash: '', verifyCircularProgress: false});
                alert(`Invoice ID Hash Exists!`)
            } else {
                this.setState({verifyCircularProgress: false});
                alert('Invoice ID Hash didn\'t Exists')
            }                    
        } else {
            alert('Missing Invoice ID Hash!')
            console.log('Invoice ID Hash is missing');
        }
    }

    handleGetInvoiceId = async () => {
        if (this.state.getInvoiceIdHash !== '') {
            this.setState({getInvoiceIdCircularProgress: true})            
            let txResult = await this.state.contract.methods.getInvoiceID(this.state.getInvoiceIdHash).call({ from: this.state.accounts[0] })
            if (txResult) {
                this.setState({getInvoiceIdHash: '', getInvoiceIdCircularProgress: false});                    
                alert(`Invoice ID Hash Exists! Invoice ID ${txResult}`)
            } else {
                this.setState({getInvoiceIdCircularProgress: false});
                alert('Invoice ID Hash didn\'t Exists')
            }                    
        } else {
            alert('Missing Invoice ID Hash!');
            console.log('Invoice ID hash missing');
        }
    }

    render() {
        return (
            <Layout>
                <div>
                    <Paper className="reqWidget">
                        <div>
                            <div className="widgetHeading">Add Invoice ID</div>
                            <table>
                                <tr>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="invoiceId" label="Invoice ID" value={this.state.invoiceId}/>
                                    </td>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="invoiceIdHash" label="Invoice ID Hash" value={this.state.invoiceIdHash}/>
                                    </td>
                                    <td>
                                        {(this.state.submitCircularProgress)? <CircularProgress/> : <ButtonBase size="small" onClick={this.handleSubmit} style={{backgroundColor: '#004681', color:'#ffffff', padding: '10px'}}>Submit</ButtonBase>}
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <div className="widgetHeading">Is Hash Exists</div>
                            <table>
                                <tr>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="verifyInvoiceIdHash" label="Invoice ID Hash" value={this.state.verifyInvoiceIdHash}/>
                                    </td>
                                    <td>
                                        {(this.state.verifyCircularProgress)? <CircularProgress/> : <ButtonBase size="small" onClick={this.handleIsHashExists} style={{backgroundColor: '#004681', color:'#ffffff', padding: '10px'}}>Is Hash Exists</ButtonBase>}
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <div className="widgetHeading">Get Invoice Id</div>
                            <table>
                                <tr>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="getInvoiceIdHash" label="Invoice ID Hash" value={this.state.getInvoiceIdHash}/>
                                    </td>
                                    <td>
                                        {(this.state.getInvoiceIdCircularProgress)? <CircularProgress/> : <ButtonBase size="small" onClick={this.handleGetInvoiceId} style={{backgroundColor: '#004681', color:'#ffffff', padding: '10px'}}>Get InvoiceId</ButtonBase>}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </Paper>
                </div>
            </Layout>
        )
    }
}