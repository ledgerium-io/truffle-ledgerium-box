import Web3 from 'web3'

const resolveWeb3 = (resolve) => {
  // let { web3 } = window
  // console.log('Window:------------ ', window.ledgerium)
  // console.log('Web3: --', web3)
  // const alreadyInjected = typeof web3 !== 'undefined' // i.e. Mist/Metamask
  // const alreadyInjected = false
  // console.log('----------------------', alreadyInjected)
  
  // const localProvider = `http://127.0.0.1:7545`

  // if (alreadyInjected) {
    console.log(`Injected web3 detected.`)
    web3 = new Web3(window.ledgerium);
    web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined");
    resolve(web3)

  // } else {
    // console.log(`No web3 instance injected, using Local web3.`)
    // const provider = new Web3.providers.HttpProvider(localProvider)
    // new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    // web3 = new Web3(provider)
    // resolve(web3)
  // }

}

export default () =>
  new Promise((resolve) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener(`load`, () => {
      resolveWeb3(resolve)
    })
    // If document has loaded already, try to get Web3 immediately.
    if (document.readyState === `complete`) {
      resolveWeb3(resolve)
    }
  })
