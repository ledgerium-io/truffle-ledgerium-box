![Truffle & Ledgerium](./box-img-sm.png "Truffle & Ledgerium")

# Truffle & Ledgerium Truffle Box

This box gives you a boilerplate to get up and running quickly with Truffle on a Ledgerium Blockchain.

## Installation

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

## Connect to Ledgerium

1. In Ledgerium, select the node you want to connect to, then choose `+ Connect Node`.

2. Select `Native JSON/RPC`

3. Choose an application credential to use for this connection.

4. Choose the `Truffle Suite` connection type.

5. Copy the connection info from this panel into the respective variables inside of `truffle-config.js`. 

6. Migrate your contracts to your Ledgerium chain!

```
truffle migrate
```
