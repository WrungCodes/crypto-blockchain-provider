/**
 * for easier export
 */
export namespace ProviderOptions {

    export interface BitcoinOptions {
        rpcAddress: string;
    }

    export interface EtheriumOptions {
        rpcAddress: string;
        address: string;
    }
    
    export interface EtheriumTokenOptions {
        rpcAddress: string;
        tokenId: string;
        ticker: string;
    }
}