# Multi-Blockchain Provider Interface

This project provides a common interface for interacting with multiple blockchain networks, enabling functionalities such as sending assets, checking balances, and generating addresses with support for Helium (HNT), Bitcoin (BTC), and Ethereum (ETH), including Ethereum tokens.

## Features

- Support for HNT, BTC, and ETH networks, along with Ethereum tokens.
- Functions to send assets, check balances, and generate new blockchain addresses.
- Easy integration with different blockchain technologies through a unified interface.

## Installation

npm install


## Example Usage

### Interacting with Ethereum

```javascript
const provider = await getCryptoProvider([IProvider.ETH, {rpcAddress: 'http://eth.rpc.com'}]);
const { address, privateKey } = await provider.generateKeyPair();
const balance = await provider.balanceByAddress(address);
const txData = await provider.txCreate({
    subtractFee: false,
    agent: '',
    value: '',
    credentials: ''    
});

const transferData = await provider.txTransferRaw({ data: '', info: {} });

const provider = await getCryptoProvider([
    IProvider.ETHTOKEN, 
    { rpcAddress: 'http://eth.rpc.com', tokenId: "0x25f4c2e11838c1373f47c400011034cc1758da60", ticker: "DFN" }
]);
provider.initialize();
const { address, privateKey } = await provider.generateKeyPair();
const balance = await provider.balanceByAddress(address);
```
