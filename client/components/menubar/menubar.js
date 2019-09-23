import React,{ Component } from 'react';
import { ButtonBase, Popper, ClickAwayListener, MenuList, MenuItem, Grow, Paper } from '@material-ui/core' ;
import { MdHome } from 'react-icons/md';
import Link from 'next/link';
import './style.css'

export default class MenuBar extends Component {
    constructor() {
        super();
        this.state = {
            open: false,
            topMenu: [],
            childMenu: []
        };
        this.menuContent = '';
    }

    componentDidMount() {
        this.menuContent = [        
            {
                "id": "getAccounts",
                "label": "Get Accounts",
                "url": "/accounts"
            },
            {
                "id": "public",
                "label": "Public Transactions",
                "url": "/public"
            },
            {
                "id": "publicwallet",
                "label": "Public Transactions using Ledgerium Wallet",
                "url": "/publicwallet"
            },
            {
                "id": "private",
                "label": "Private Transactions",
                "url": "/private"
            },
            
        ]

        this.buildTopLevelMenu(this.menuContent)
    }

    buildTopLevelMenu = (menuItems) => {
        this.setState({topMenu: []});        
        let topMenu = [];
        topMenu.push(<MenuButton><Link href={`/`}><MdHome style={{ fontSize: '20px' }}/></Link></MenuButton>)
        menuItems.forEach(element => {
            let markup;
            if (element.url && element.url.trim().length > 0) {
                markup = 
                    <MenuButton><Link href={`${element.url}`}><div>{element.label}</div></Link></MenuButton>
            } else {
                markup = 
                    <MenuButton handleClick={(e) => this.handleClick(e, element.id)}>{element.label}</MenuButton>
            }
            topMenu.push(markup)
        });

        /** Build child menu tress */
        this.menuChilds = {}
        menuItems.forEach(element => {
            if (element.children && element.children.length > 0) {
                let childItems = [];
                element.children.forEach(child => {
                    childItems.push(
                        <MenuItem onClick={this.handeleClose}>
                            <Link href={child.url}>
                                <div style={{ color: '#ffffff', fontSize: '12px'}}>{child.label}</div>
                            </Link>
                        </MenuItem>
                    )
                });
                this.menuChilds[element.id] = childItems;
            }
        });
        this.setState({ topMenu: topMenu })
    }

    buildChildMenu = (parentName) => {
        this.setState({ childMenu: this.menuChilds[parentName] })
    }

    handleClick = (event, id) => {
        this.setState({
            childMenu: this.menuChilds[id],
            anchorE1: event.target,
            open: true
        })
    }

    handeleClose = (event) => {
        if (this.state.anchorEl === event.target) {
            return;
        }
        this.setState({ open: false });
    }

    render() {
        return (
            <div className="topMenuPanel">
                {this.state.topMenu}

                <Popper open={this.state.open} anchorEl={this.state.anchorEl} placement="bottom-start" transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="menu-list-grow"
                            style={{
                                transformOrigin: 'bottom-start'
                            }}
                        >
                            <Paper square={true} style={{ backgroundColor: '#004681' }}>
                                <ClickAwayListener onClickAway={this.handeleClose}> 
                                    <MenuList>
                                        {this.state.childMenu}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>

                        </Grow>
                    )}
                </Popper>
            </div>
        )
    }
}

const MenuButton = (props) => {
    return (
        <ButtonBase style={{ height: '100%' }} onClick={props.handleClick} onMouseOver={props.handleClick}>
            <div className="menuButton">
                {props.children}
            </div>
        </ButtonBase>
    )
}