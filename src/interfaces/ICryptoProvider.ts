import { KeyPair, TransactionSendResult, TransactonData } from "./CyptoTransaction";

export interface ICryptoProvider<CustomTxOptions> {
  generateKeyPair(path?: string): Promise<KeyPair>;
  validateTransactionOptions(options: CustomTxOptions): Promise<boolean>;
  balanceByAddress(address: string, hashes?: any): Promise<string>;
  txCreate(options: CustomTxOptions): Promise<TransactonData>;
  txTransferRaw(options: CustomTxOptions): Promise<string>;
  txGetSendingResult(txid: string, data?: any): Promise<TransactionSendResult>;
  txGetReceipt(txid: string, params?: any): Promise<any>;
}