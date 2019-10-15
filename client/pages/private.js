import React, { Component } from 'react';
import Layout from '../components/layout/layout'
import {
    Paper,    
    TextField,
    CircularProgress,
    ButtonBase
} from '@material-ui/core';
import '../stylesheets/public.css'
import crypto from 'crypto';
import axios from 'axios';

export default class Private extends Component {
    constructor() {
        super();
        this.state = {
            invoiceId: '',
            invoiceIdHash: '',
            fromPublicKey: '',
            fromHost: '',
            fromPort: '',
            toPublicKey: '',
            toHost: '',
            toPort: '',
            verifyInvoiceIdHash: '',
            verifyInvoiceIdFromHost: '',
            verifyInvoiceIdFromPort: '',
            getInvoiceIdHash: '',
            getInvoiceIdFromHost: '',
            getInvoiceIdFromPort: '',            
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

    handleSubmit = async () => {
        if (this.state.invoiceId !== '' && this.state.invoiceIdHash !== '') {
            this.setState({submitCircularProgress: true})
            let params = {
                "invoiceId": this.state.invoiceId,
                "invoiceIdHash":  this.state.invoiceIdHash,                
                "fromPublicKey": this.state.fromPublicKey,
                "fromHost": this.state.fromHost,
                "fromPort":  this.state.fromPort,
                "toPublicKey": this.state.toPublicKey,
                "toHost":  this.state.toHost,
                "toPort": this.state.toPort                
            }
            axios.post('http://localhost:9086/private/addinvoiceid', params)
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
            axios.post('http://localhost:9086/private/ishashexists', params)
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
        if (this.state.verifyInvoiceIdHash !== '' || this.state.verifyInvoiceIdFromHost !== '' || this.state.verifyInvoiceIdFromPort !== '') {
            this.setState({verifyCircularProgress: true})
            let params = {
                "invoiceIdHash": this.state.verifyInvoiceIdHash,
                "hostAddress": this.state.verifyInvoiceIdFromHost,
                "hostPort": this.state.verifyInvoiceIdFromPort
            }            
            axios.post('http://localhost:9086/private/ishashexists', params)
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

    handleGetInvoiceId = () => {
        if (this.state.getInvoiceIdHash !== '' || this.state.getInvoiceIdFromHost !== '' || this.state.getInvoiceIdFromPort !== '') {
            this.setState({getInvoiceIdCircularProgress: true})
            let params = {
                "invoiceIdHash": this.state.getInvoiceIdHash,
                "hostAddress": this.state.getInvoiceIdFromHost,
                "hostPort": this.state.getInvoiceIdFromPort
            }            
            axios.post('http://localhost:9086/private/getinvoiceid', params)
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
                                        <TextField onChange={this.handleChange} type="text" name="fromHost" label="Sender HOST" value={this.state.fromHost}/>
                                    </td>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="fromPort" label="Sender PORT" value={this.state.fromPort}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="toHost" label="Receiver HOST" value={this.state.receiverHost}/>
                                    </td>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="toPort" label="Receiver PORT" value={this.state.receiverPort}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>                                        
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
                                        <TextField onChange={this.handleChange} type="text" name="verifyInvoiceIdFromHost" label="Sender HOST" value={this.state.verifyInvoiceIdFromHost}/>
                                    </td>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="verifyInvoiceIdFromPort" label="Sender PORT" value={this.state.verifyInvoiceIdFromPort}/>
                                    </td>
                                </tr>
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
                                        <TextField onChange={this.handleChange} type="text" name="getInvoiceIdFromHost" label="Sender HOST" value={this.state.getInvoiceIdFromHost}/>
                                    </td>
                                    <td>
                                        <TextField onChange={this.handleChange} type="text" name="getInvoiceIdFromPort" label="Sender PORT" value={this.state.getInvoiceIdFromPort}/>
                                    </td>
                                </tr>
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