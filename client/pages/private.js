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

export default class Private extends Component {
    constructor() {
        super();
        this.state = {
            invoiceId: '',
            invoiceIdHash: '',
            fromPublicKey: '',
            toPublicKey: '',
            fromNodePort: '',
            verifyInvoiceIdHash: '',
            getInvoiceIdHash: '',
            accounts: [],
            contract: '',
            submitCircularProgress: false,
            verifyCircularProgress: false,
            getInvoiceIdCircularProgress: false
        }
    }

    componentDidMount() {
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    }

    addInvoice = async (invoiceId) => {        
        console.log('Invoice ID: ',invoiceId);
        let invoiceIdHash = await this.prepareHash(invoiceId)._v;
        console.log('Invoice ID Hash: ', invoiceIdHash);

        let txResult = await this.state.contract.methods.addInvoice(invoiceId, invoiceIdHash).send({ from: this.state.accounts[0], gas:3000000 });
        console.log('Tx Result: ',txResult);        
        return txResult;
    };

    verifyInvoice = async (invoiceId) => {
        console.log('Invoice ID: ', invoiceId);
        let invoiceIdHash = this.prepareHash(invoiceId)._v;
        console.log('Invoice ID Hash: ', invoiceIdHash);
        let txResult = await this.state.contract.methods.isHashExists(invoiceIdHash).call({ from: this.state.accounts[0] })
        console.log('Tx Result: ', txResult);
        return txResult;
    }

    prepareHash = async (invoiceId) => {
        return crypto.createHash('sha256').update(invoiceId).digest('hex');
    }

    handleSubmit = async () => {
        if (this.state.invoiceId !== '' && this.state.invoiceIdHash !== '') {
            this.setState({submitCircularProgress: true})
            let params = {
                "invoiceId": this.state.invoiceId,
                "invoiceIdHash":  this.state.invoiceIdHash,
                "fromPublicKety": this.state.fromPublicKey,
                "fromPrivateKey": this.state.toPublicKey
            }
            axios.post('http://localhost:9086/private/addInvoiceId', params)
            .then((result) => { 
                console.log('result status: ', result.txResult);
                if (result.data.txResult.status) {
                    this.setState({invoiceId: '', invoiceIdHash: '', submitCircularProgress: false});
                    alert(`Sucessfully added Invoice ID!`)
                } else {
                    this.setState({submitCircularProgress: false});
                    alert('Failed to add Invoice ID!')
                }
            })
        } else {
            alert('Missing Invoice ID or Invoice ID hash')
            console.log('Invoice ID is missing');
        }
    }

    handleVerify = async () => {
        if (this.state.verifyInvoiceIdHash !== '') {
            this.setState({verifyCircularProgress: true})
            let params = {
                "invoiceIdHash": this.state.verifyInvoiceIdHash
            }
            // let result = await this.verifyInvoice(this.state.verifyInvoiceId)
            axios.post('http://localhost:9086/private/isHashExists', params)
            .then((result) => {
                console.log('Result: ', result.data)
                if (result.data.queryResult) {
                    this.setState({verifyInvoiceIdHash: '', verifyCircularProgress: false});
                    alert(`Invoice ID Hash Exists!`)
                } else {
                    this.setState({verifyCircularProgress: false});
                    alert('Invoice ID Hash didn\'t Exists')
                }        
            })
        } else {
            alert('Missing Invoice ID Hash!')
            console.log('Invoice ID Hash is missing');
        }
    }

    handleIsHashExists = async () => {
        if (this.state.verifyInvoiceIdHash !== '') {
            this.setState({verifyCircularProgress: true})
            let params = {
                "invoiceIdHash": this.state.verifyInvoiceIdHash
            }
            // let result = await this.verifyInvoice(this.state.verifyInvoiceId)
            axios.post('http://localhost:9086/private/isHashExists', params)
            .then((result) => {
                console.log('Result: ', result.data)
                if (result.data.queryResult !== '') {
                    this.setState({verifyInvoiceIdHash: '', verifyCircularProgress: false});
                    alert(`Invoice ID Hash Exists!`)
                } else {
                    this.setState({verifyCircularProgress: false});
                    alert('Invoice ID Hash didn\'t Exists')
                }        
            })
        } else {
            alert('Missing Invoice ID Hash!')
            console.log('Invoice ID Hash is missing');
        }
    }

    handleGetInvoiceId = () => {
        if (this.state.getInvoiceIdHash !== '') {
            this.setState({getInvoiceIdCircularProgress: true})
            let params = {
                "invoiceIdHash": this.state.getInvoiceIdHash
            }
            // let result = await this.verifyInvoice(this.state.verifyInvoiceId)
            axios.post('http://localhost:9086/public/getInvoiceId', params)
            .then((result) => {
                console.log('Result: ', result.data)
                if (result.data.queryResult) {
                    this.setState({getInvoiceIdHash: '', getInvoiceIdCircularProgress: false});                    
                    alert(`Invoice ID Hash Exists! Invoice ID ${result.data.queryResult}`)
                } else {
                    this.setState({getInvoiceIdCircularProgress: false});
                    alert('Invoice ID Hash didn\'t Exists')
                }        
            })
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
                                </tr>
                                <tr>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="fromPublicKey" label="Sender Public Key" value={this.state.fromPublicKey}/>
                                    </td>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="toPublicKey" label="Receiver Public Key" value={this.state.toPublicKey}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="fromNodePort" label="Sender PORT" value={this.state.fromNodePort}/>
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