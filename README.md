# <img src="box-img-lg.png" width="100" height="100"/>
## **Truffle & Ledgerium Truffle Box**

This box gives you a boilerplate to get up and running quickly with Truffle on a Ledgerium Blockchain.

## **Installation**

First ensure you are in a new and empty directory.

1. Run the `unbox` command with `npx` and skip to step 3. This will install all necessary dependencies.

```
npx truffle unbox ledgerium-io/truffle-ledgerium-box
```

2. Alternatively, you can install Truffle globally and then run the `unbox` command.

```
npm install -g truffle
truffle unbox ledgerium-io/truffle-ledgerium-box
```

3. Run the development console. This will instantiate a local chain for you to test that Truffle is working properly.

```
truffle develop
```

4. Ensure that you're able to both compile, test, and finally migrate your contracts to your local chain.

```
compile
test
migrate
```

5. If everything looks good, you can exit the Truffle console with `.exit`.

## **Connect to Ledgerium**

- **Following section is to connect with Ledgerium blockchain**. 

The `truffle-config.js` under truffle-ledgerium-box folder
```
module.exports = {
 networks: {
   flinders: {
     host: '138.197.193.201', //flinders testnet, 'testnet.ledgerium.net' for toorak
     port: 8545, //Need to check with RPC port of the specific ledgerium node, default 8545
     network_id: '2020', // Match any network id
     from: '0xef759369e2b95b207fcc9ec2a6925fe3f8945f8f'
   }
 },
 solc: {
   // Turns on the Solidity optimizer. For development the optimizer's
   // quite helpful, just remember to be careful, and potentially turn it
   // off, for live deployment and/or audit time. For more information,
   // see the Truffle 4.0.0 release notes.
   //
   // https://github.com/trufflesuite/truffle/releases/tag/v4.0.0
   optimizer: {
     enabled: true,
     runs: 200
   }
 }
};
```
User needs to interact with one of the **flinders’s** block producers node i.e. `138.197.193.201` with its RPC port 8545.
Set the `from` field to ”0xef759369e2b95b207fcc9ec2a6925fe3f8945f8f”

- **Migrate your invoice contract to the Ledgerium Flinders Blockchain node**.
```
➜  truffle-ledgerium-box git:(master) ✗ truffle migrate --network flinders
⚠️  Important ⚠️
If you're using an HDWalletProvider, it must be Web3 1.0 enabled or your migration will hang.

Starting migrations...
======================
> Network name:    'flinders'
> Network id:      2020
> Block gas limit: 9007199254740000

2_deploy_contracts.js
=====================
Going to connect to  http://138.197.193.201:8545

   Replacing 'Invoice'
   -------------------
   > transaction hash:    0x07dfbc952706346fabf255abf063eee389dd834bb50fc0395c416e0508a64eb2
   > Blocks: 1            Seconds: 8
   > contract address:    0xBeA37B161d94b2c3140376E264929BC21B0A1518
   > account:             0xd34fC4abe46BfDb1939e00b3dcd5B27911a6C05d
   > balance:             2.98471562
   > gas used:            521367
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.01042734 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.01042734 ETH

Summary
=======
> Total deployments:   1
> Final cost:          0.01042734 ETH

```

- **Take the test XLG from Ledgerium Faucet** 

Connect to Ledgerium Blockchain Flinders testnet with one of the Block Producer’s node `138.197.193.201`. Additionally, the Ledgerium account which needs to be used to execute public transactions has to be imported as the node’s native account. Below are the steps showing, how to connect to the remote node on RPC `http://138.197.193.201:8545` and import the account using its private key, along with some password (which needs to be remembered for later usages too).

``` 
>  geth attach http://138.197.193.201:8545
Welcome to the Geth JavaScript console!

instance: Geth/validator-138.197.193.201/v1.8.12-stable-46338e95(quorum-v2.2.1)/linux-amd64/go1.11.10
coinbase: 0x1a67eea756b9c074219dbbd1a68b7a6919412645
at block: 19010 (Wed, 04 Sep 2019 00:38:13 AEST)
 datadir: /eth
 modules: admin:1.0 debug:1.0 eth:1.0 istanbul:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

> personal.importRawKey("20a139ed2023c910d54b2ce7fb4377d81dd3471d6f16f27116c39c6184a3fd7c","password")
"0xef759369e2b95b207fcc9ec2a6925fe3f8945f8f"
> 
```
Since the transactions will be sent unsigned by the private key, the account needs to be unlocked before executing it. It can be done 2 ways. Go to **geth** console

```
geth attach http://138.197.193.201:8545
Welcome to the Geth JavaScript console!

instance: Geth/validator-138.197.193.201/v1.8.12-stable-46338e95(quorum-v2.2.1)/linux-amd64/go1.11.10
coinbase: 0x1a67eea756b9c074219dbbd1a68b7a6919412645
at block: 29279 (Wed, 04 Sep 2019 14:53:58 AEST)
 datadir: /eth
 modules: admin:1.0 debug:1.0 eth:1.0 istanbul:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

> personal.unlockAccount("0xef759369e2b95b207fcc9ec2a6925fe3f8945f8f","password")
true
> 
```
Or Unlock it programmatically by connecting the node with web3 and call

```
web3.eth.personal.unlockAccount(“0xef759369e2b95b207fcc9ec2a6925fe3f8945f8f”,"password")

```

Now, the Ledgerium account is ready to be used for the rest of the workflow. 

Set the address in ./server/src/globalconfig.js 
```module.exports.ACCOUNT = process.env.ACCOUNT || "0xef759369e2b95b207fcc9ec2a6925fe3f8945f8f"

module.exports.CONTRACT = process.env.CONTRACT || "0xBeA37B161d94b2c3140376E264929BC21B0A1518"

```

## **Run node express back end server**

1. First ensure that you're in the truffle-ledgerium-box/api folder.

2. Run the npm install command. This will install all necessary node dependencies.

```
npm install
```

3. Run the node express back end server in dev mode. This will up bring the express server on PORT 9086.

```
npm run dev
```

4. Make a test get call to express server. This will return "Hello from the API message".

```
http://localhost:9086
```

## **Run react front end application**

1. First ensure that you're in the truffle-ledgerium-box/client folder.

2. Run the npm install command. This will install all necessary node dependencies.

```
npm install
```

3. Run the web application in dev mode. This will up bring the react front end application on PORT 4000.

```
npm run dev
```
4. Check out to the following URL to access the web application.

```
http://localhost:4000
```
