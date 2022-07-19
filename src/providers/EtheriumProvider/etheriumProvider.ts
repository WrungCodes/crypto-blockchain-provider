import { ICryptoProvider } from "../../interfaces/ICryptoProvider";
import { KeyPair, ProviderTxOptions, TransactionSendResult, TransactonData } from "../../interfaces/CyptoTransaction";
import { ProviderOptions } from "../../interfaces/IProviderOptions";

class EtheriumProvider implements ICryptoProvider<EtheriumTxOptions> {

    constructor(options: ProviderOptions.EtheriumOptions) {}

    generateKeyPair(): Promise<KeyPair> {
        throw new Error("Method not implemented.");
    }

    validateTransactionOptions(options: EtheriumTxOptions): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    balanceByAddress(address: string, hashes?: any): Promise<string> {
        throw new Error("Method not implemented.");
    }

    txCreate(options: EtheriumTxOptions): Promise<TransactonData> {
        throw new Error("Method not implemented.");
    }

    txTransferRaw(options: EtheriumTxOptions): Promise<string> {
        throw new Error("Method not implemented.");
    }

    txGetSendingResult(txid: string, data?: any): Promise<TransactionSendResult> {
        throw new Error("Method not implemented.");
    }

    txGetReceipt(txid: string, params?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export interface EtheriumTxOptions extends ProviderTxOptions {}

export default EtheriumProvider;