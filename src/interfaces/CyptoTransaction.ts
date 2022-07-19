export enum TransactionStatus {
    pending = 'pending',
    rejected = 'rejected',
    processing = 'processing',
    sent = 'sent',
    error = 'error',
}

export type TAddress = string;
export type TMemo = string;
export type TAmount = string;

export interface Log {
    address: string;
    data: string;
    topics: string[];
    logIndex: number;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
}

export interface TransactionSendResult {
    status: TransactionStatus;
    error?: Error;
    info?: {
      id: string;
      message: string;
      sentTime?: Date;
    };
  }

export interface TransactionReceipt {
    block?: string;
    blockHash: string;
    hash: string;
    from?: TAddress | TAddress[];
    to: TAddress | TAddress[];
    memo?: TMemo;
    date: Date;
    amount: string;
    verified: boolean;
    confirmations?: number;
    tokenId?: string;
    tokenAccount?: string;
    outputId?: number;
    logs?: Log[];
}

export interface KeyPair {
    address: string;
    privateKey: string;
    publicKey?: string;
    bip39?: string;
    hexAddress?: string;
}

export interface TxGasParams {
    gasValue: string;
}

export interface TransactonData {
    data: string;
    info: any;
    gasParams?: TxGasParams;
}

export interface OutputAgent {
    address: string;
    privateKey: string;
    agentId: string;
}
export interface TransactionCredentials {
    address: string;
    memo?: string | null;
}

export interface Subsidy {
    privateKey: string;
}

export interface ProviderTxOptions {
    agent: OutputAgent;
    credentials: TransactionCredentials;
    value: string;
    subsidy?: Subsidy;
    subtractFee?: boolean;
    nonce?: string;
}  