import Web3 from "web3";
import { KeyPair, ProviderTxOptions, TransactionSendResult, TransactionStatus, TransactonData } from "../../interfaces/CyptoTransaction";
import { ICryptoProvider } from "../../interfaces/ICryptoProvider";
import { ProviderOptions } from "../../interfaces/IProviderOptions";
import { BigNumber } from 'bignumber.js';

// TODO: make EtheriumTokenProvider and EtheriumProvider Inherit from an Abstract Class
class EtheriumTokenProvider implements ICryptoProvider<EtheriumTokenTxOptions, EtheriumTokenTxDataOptions> {
    /** Node Url of the blockchain */
    private rpcAddress: string;

    /** Web3 Object for carrying out SC & EVM calls */
    private web3: Web3;

    /** Number of decimals for the Token */
    private decimals: number;

    /** Number of blocks to pass before we confirm transactions as successful */
    private blocksRequiredForConfirmed: number;

    /** the contract object */
    private contract: any;

    /** Address of the Token Smart Contract */
    private tokenId: string;

    /** Short Name of the Token */
    private ticker: string;

    /** Check to see if the  */
    private inititiated: boolean;

    isToken: boolean = true;

    constructor(options: ProviderOptions.EtheriumTokenOptions){
        this.decimals = 18
        this.inititiated = false;
        this.blocksRequiredForConfirmed = 5;
        this.rpcAddress = options.rpcAddress;
        this.tokenId = options.tokenId;
        this.ticker = options.ticker;
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.rpcAddress));
    }

    async initialize() {
        let abi: any;
        this.contract = new this.web3.eth.Contract(abi, this.tokenId);
        this.decimals = await this.contract.methods.decimals().call();
        this.inititiated = true;
    }

    /** Check if Token Smartcontract has been initialize */
    checkInititiate(){
        if(!this.inititiated) {throw new Error("Token Not Inititiate");}
    }

    async generateKeyPair(path?: string | undefined): Promise<KeyPair> {
        const keys = this.web3.eth.accounts.create();

        return {
          address: keys.address,
          privateKey: keys.privateKey,
        };
    }

    validateAddress(address: string): Boolean {
        return this.web3.utils.isAddress(address);
    }

    async validateTransactionOptions(options: EtheriumTokenTxOptions): Promise<boolean> {
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
        this.checkInititiate()
        return await this.contract.methods.balanceOf(address).call()
    }

    async txCreate(options: EtheriumTokenTxOptions): Promise<TransactonData> {
        this.checkInititiate()

        const nonce = await this.web3.eth.getTransactionCount(options.agent.address, 'pending')
        const tokenValue = this.toNativeNumber(options.value);

        const txData = {
            from: options.agent.address,
            to: this.tokenId,
            value: '0x0',
            data: this.contract.methods.transfer(options.credentials.address, `0x${tokenValue.toString(16)}`).encodeABI(),
            nonce,
            gasLimit: 25000
        }

        const possibleGasPrice =  new BigNumber(await this.web3.eth.getGasPrice()).plus(5 * 10 ** 9); // Adding 5 gwei to an average price
        const maxGasPrice = new BigNumber(950 * 10 ** 9); // max gas willing to spend

        const gasPrice = possibleGasPrice.gt(maxGasPrice) ? maxGasPrice : possibleGasPrice;
        const gasLimit = await this.web3.eth.estimateGas(txData);
        const gasValue = gasPrice.multipliedBy(new BigNumber(txData.gasLimit)).toString()

        txData.gasLimit += gasLimit

        const signed = await this.web3.eth.accounts.signTransaction(txData, options.agent.privateKey);

        return {
            data: JSON.stringify(signed),
            info: null,
            gasParams: { gasValue }
          };
    }

    async txTransferRaw(options: EtheriumTokenTxDataOptions): Promise<string> {
        try {
         return (await this.web3.eth.sendSignedTransaction(options.data)).transactionHash  
        } catch (error) {
         throw new Error("Unable for transfer");
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
        return await this.web3.eth.getTransactionReceipt(txid)
    }

    toNativeNumber(base: string | number ): BigNumber {
        return new BigNumber(base).times(10 ** this.decimals);
    }
    
    fromNativeNumber(base: string | number ): string {
    return new BigNumber(base).dividedBy(10 ** this.decimals).toString(10);
    }

}

export interface EtheriumTokenTxOptions extends ProviderTxOptions {}

export interface EtheriumTokenTxDataOptions extends TransactonData {}

export default EtheriumTokenProvider;
