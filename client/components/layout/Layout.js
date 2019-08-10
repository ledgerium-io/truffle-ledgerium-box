import React,{ Component } from 'react';
import Header from '../header/Header';
import MenuBar from '../menuBar/MenuBar';

export default class Layout extends Component {
    constructor(){
        super();
    }

    render() {
        return(
            <div style={{height:'100%'}}>
                <Header></Header>
                <MenuBar></MenuBar>
                <div className="contentSection">
                    {this.props.children}
                </div>
            </div>
        )
    }
}