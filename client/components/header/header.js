import React,{ Component } from 'react';
import * as logo from '../../assets/img/ledgerium_logo_blue.svg';
import './style.css'

export default class Header extends Component {
    constructor() {
        super();
    }
    render() {
        return(
            <div id="header">
                <a className="navbar-logo" href="http://testnet.ledgerium.net:2000/app/blockexplorer">
                    <img alt="Logo" width="75px" src={logo} />
                </a>
                <div id="titleHolder">Truffle with Ledgerium Blockchain</div>
            </div>
        )
    }
}