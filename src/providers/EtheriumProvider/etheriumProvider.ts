import { ICryptoProvider } from "../../interfaces/ICryptoProvider";
import { KeyPair, ProviderTxOptions, TransactionSendResult, TransactionStatus, TransactonData } from "../../interfaces/CyptoTransaction";
import { ProviderOptions } from "../../interfaces/IProviderOptions";
import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';

class EtheriumProvider implements ICryptoProvider<EtheriumTxOptions, EtheriumTxDataOptions> {
    private rpcAddress: string;
    private web3: Web3;
    private decimals: number;
    private blocksRequiredForConfirmed: number;

    constructor(options: ProviderOptions.EtheriumOptions) {
        this.decimals = 18
        this.blocksRequiredForConfirmed = 5;
        this.rpcAddress = options.rpcAddress
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.rpcAddress));
    }
    
    initialize() {}

    isToken: boolean = false;

    async generateKeyPair(): Promise<KeyPair> {

        const keys = this.web3.eth.accounts.create();

        return {
          address: keys.address,
          privateKey: keys.privateKey,
        };
    }

    validateAddress(address: string): Boolean {
        return this.web3.utils.isAddress(address);
    }

    async validateTransactionOptions(options: EtheriumTxOptions): Promise<boolean> {
        if(
            !this.validateAddress(options.agent.address) 
            || !this.validateAddress(options.credentials.address)
            || this.web3.eth.accounts.privateKeyToAccount(options.agent.privateKey).address !== options.agent.address.toLowerCase()
            )
        {
            return false;
        }
        return true;
    }

    async balanceByAddress(address: string, hashes?: any): Promise<string> {

        // if hash is present, get the block number of the hash
        if(hashes) {
            const block = await this.web3.eth.getBlock(hashes)

            return this.web3.eth.getBalance(address, block.number)
        }

        return await this.web3.eth.getBalance(address)
    }

    async txCreate(options: EtheriumTxOptions): Promise<TransactonData> {

        if(!this.validateTransactionOptions(options)){ 
            throw new Error('Options are Incorrect')
        }

        const nonce = await this.web3.eth.getTransactionCount(options.agent.address);
        const timestamp = Math.floor(Date.now() * 1000)

        const gas = 21000;
        const gasPrice = await this.web3.eth.getGasPrice();

        const blockHeight = await this.web3.eth.getBlockNumber();

        const amount = new BigNumber(this.toNativeNumber(options.value).toString(10));
        const gasValue = new BigNumber(gasPrice).times(gas as number);
        const finalAmount = options.subtractFee ? amount.minus(gasValue) : amount;

        if (!finalAmount.gt(0)) {
          throw new Error('Amount should be greater than zero');
        }

        const tx = {
            to: getNakedHexString(options.credentials.address),
            value: finalAmount.toString(10),
            timestamp: timestamp,
            nonce: nonce,
            gas: gas,
            gasPrice: gasPrice,
            data: '',
        };

        const signed = await this.web3.eth.accounts.signTransaction(tx, options.agent.privateKey);

        return {
            data: JSON.stringify(signed),
            info: {
              nonce: tx.nonce,
              gasPrice: tx.gasPrice,
              gas: tx.gas,
              createBlockHeight: blockHeight,
            },
            gasParams: {
                gasValue: gasValue.toString()
            }
        };
    }

    async txTransferRaw(options: EtheriumTxDataOptions): Promise<string> {
        const { rawTransaction } = JSON.parse(options.data);
        try {
          const { transactionHash } = await this.web3.eth.sendSignedTransaction(rawTransaction);
          return transactionHash;
        } catch (error) {
          throw new Error(`Error txTransferRaw: ${error}`);
        }
    }

    async txGetSendingResult(txid: string, data?: any): Promise<TransactionSendResult> {

        try {
            const receipt = await this.web3.eth.getTransactionReceipt(txid);
            
            if (receipt) {
                const blockHeight = await this.web3.eth.getBlockNumber();

                if (!receipt.blockNumber || blockHeight - Number(receipt.blockNumber) < this.blocksRequiredForConfirmed) {
                    return {
                      status: TransactionStatus.processing, // not found yet
                    };
                  } else {
                    return {
                      status: TransactionStatus.sent,
                      info: {
                        id: txid,
                        message: `mined in block ${receipt.blockNumber}`,
                        sentTime: new Date(),
                      }
                    }
                  }

            } else {
                return {
                  status: TransactionStatus.processing, // not found yet
                };
            }

        } catch (error) {
            return {
                status: TransactionStatus.error,
                error: error as Error,
            }
        }
    }

    async txGetReceipt(txid: string, params?: any): Promise<any> {
        return await this.web3.eth.getTransactionReceipt(txid);
    }

    toNativeNumber(base: string | number ): BigNumber {
        return new BigNumber(base).times(10 ** this.decimals);
    }
    
    fromNativeNumber(base: string | number ) {
        return new BigNumber(base).dividedBy(10 ** this.decimals).toString(10);
    }
    
}

const getNakedHexString = (address: string) => (!!address ? address.toLowerCase().replace('0x', '') : '');

export interface EtheriumTxOptions extends ProviderTxOptions {}

export interface EtheriumTxDataOptions extends TransactonData {}

export default EtheriumProvider;