import { ICryptoProvider } from "../../interfaces/ICryptoProvider";
import { KeyPair, ProviderTxOptions, TransactionSendResult, TransactonData } from "../../interfaces/CyptoTransaction";
import { ProviderOptions } from "../../interfaces/IProviderOptions";
import * as bip39 from 'bip39';

import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
import { address, payments } from 'bitcoinjs-lib';

class BitcoinProvider implements ICryptoProvider<BitcoinTxOptions, BitcoinTxDataOptions> {

    constructor(options: ProviderOptions.BitcoinOptions) {}

    async generateKeyPair(): Promise<KeyPair> {
        const phrase = bip39.generateMnemonic();
        const bip32 = BIP32Factory(ecc);
        
        const seedBuffer = bip39.mnemonicToSeedSync(phrase);
        const node = bip32.fromSeed(seedBuffer);
        const account0: BIP32Interface = node.derivePath("m/44'/0'");

        const { address: addressNew } = payments.p2wpkh({ pubkey: account0.derivePath('0/0').publicKey });

        if(!addressNew) { throw new Error("Invalid Address Generation"); }

        return {
            address: addressNew,
            privateKey: account0.toBase58(),
            publicKey: account0.neutered().toBase58(),
            bip39: phrase,
        };
    }

    validateTransactionOptions(options: BitcoinTxOptions): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    balanceByAddress(address: string, hashes?: any): Promise<string> {
        throw new Error("Method not implemented.");
    }

    txCreate(options: BitcoinTxOptions): Promise<TransactonData> {
        throw new Error("Method not implemented.");
    }

    txTransferRaw(options: BitcoinTxDataOptions): Promise<string> {
        throw new Error("Method not implemented.");
    }

    txGetSendingResult(txid: string, data?: any): Promise<TransactionSendResult> {
        throw new Error("Method not implemented.");
    }

    txGetReceipt(txid: string, params?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export interface BitcoinTxOptions extends ProviderTxOptions {}

export interface BitcoinTxDataOptions extends TransactonData {}

export default BitcoinProvider;