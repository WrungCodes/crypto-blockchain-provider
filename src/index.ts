import { ICryptoProvider } from "./interfaces/ICryptoProvider";
import { ProviderOptionsType } from "./interfaces/IProviderOptionsType";
import * as Providers from "./providers";
import { IProvider } from "./interfaces/IProvider";
import { ProviderTxOptions, TransactonData } from "./interfaces/CyptoTransaction";

export { IProvider }

export async function getCryptoProvider([provider, options ]: ProviderOptionsType) : Promise<ICryptoProvider<ProviderTxOptions, TransactonData>> 
{ 
    // @ts-ignore:next-line
    return new Providers[provider](options);
}

// # Usage of function

// const provider = await getCryptoProvider([ IProvider.ETH, {rpcAddress: 'http://eth.rpc.com'}])

// const { address, privateKey } = await provider.generateKeyPair()

// const balance = await provider.balanceByAddress(address)

// const data = await provider.txCreate({
//     subtractFee: false,
//     agent: '',
//     value: '',
//     credentials: ''
    
// })

// const data = await provider.txTransferRaw({ data: '', info: {} });

// # Usage with ETH token

// ticker: 'DFN', 
// tokenId: '0x25f4c2e11838c1373f47c400011034cc1758da60', 

// const provider = await getCryptoProvider([ 
//     IProvider.ETHTOKEN, 
//     { rpcAddress: 'http://eth.rpc.com', tokenId: "0x25f4c2e11838c1373f47c400011034cc1758da60", ticker: "DFN" }
// ])

// provider.initialize()

// const { address, privateKey } = await provider.generateKeyPair()

// const balance = await provider.balanceByAddress(address)