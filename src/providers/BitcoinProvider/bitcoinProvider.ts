import { ICryptoProvider } from "../../interfaces/ICryptoProvider";
import { KeyPair, ProviderTxOptions, TransactionSendResult, TransactonData } from "../../interfaces/CyptoTransaction";
import { ProviderOptions } from "../../interfaces/IProviderOptions";

class BitcoinProvider implements ICryptoProvider<BitcoinTxOptions> {

    constructor(options: ProviderOptions.BitcoinOptions) {}

    generateKeyPair(): Promise<KeyPair> {
        throw new Error("Method not implemented.");
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

    txTransferRaw(options: BitcoinTxOptions): Promise<string> {
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

export default BitcoinProvider;