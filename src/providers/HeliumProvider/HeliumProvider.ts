import { ICryptoProvider } from "../../interfaces/ICryptoProvider";
import { KeyPair, ProviderTxOptions, TransactionSendResult, TransactionStatus, TransactonData } from "../../interfaces/CyptoTransaction";
import { ProviderOptions } from "../../interfaces/IProviderOptions";
import { BigNumber } from 'bignumber.js';
import { Keypair, Mnemonic } from '@helium/crypto'
import Address from '@helium/address';
import { Client, Network, PaymentV2 as PaymentV2Transaction, PaymentV1 as PaymentV1Transaction } from '@helium/http'
import { PaymentV1, Transaction } from '@helium/transactions'
import { Balance, CurrencyType } from '@helium/currency'

class HeliumProvider implements ICryptoProvider<HeliumTxOptions, HeliumTxDataOptions> {
    private rpcAddress: string;
    private decimals: number;
    private blocksRequiredForConfirmed: number;

    constructor(options: ProviderOptions.EtheriumOptions) {
        this.decimals = 8
        this.blocksRequiredForConfirmed = 5;
        this.rpcAddress = options.rpcAddress
    }
    
    initialize() {}

    isToken: boolean = false;

    async generateKeyPair(): Promise<KeyPair> {
        const privateKey = (await Mnemonic.create(12)).words
        const address = (await Keypair.fromWords(privateKey)).address.b58

        return { address, privateKey: privateKey.join(" ") };
    }

    validateAddress(address: string): Boolean {
        try {
            return Address.isValid(address)
        } catch (error) {
            return false
        }
    }

    async validateTransactionOptions(options: HeliumTxOptions): Promise<boolean> {
        if(
            !this.validateAddress(options.agent.address) 
            || !this.validateAddress(options.credentials.address)
            )
        {
            return false;
        }
        return true;
    }

    async balanceByAddress(address: string, hashes?: any): Promise<string> {
        try {
            const client = new Client(new Network({baseURL: this.rpcAddress, version: 1} ))
            const addressDetails = await client.accounts.get(address)

            if(!addressDetails || !addressDetails.balance)
            {
                throw new Error(`failed with error`);
            }

            return addressDetails.balance.bigInteger.toString()
          } catch (error: any) {
            throw new Error(`failed with error: ${error}`);
        }
    }

    async txCreate(options: HeliumTxOptions): Promise<HeliumTxDataOptions> {

        const {
            agent: { address: fromAddress, privateKey },
            credentials: { address: toAddress },
            value: amount,
            subtractFee: subtractFee,
        } = options;
        
        const client = new Client(new Network({baseURL: this.rpcAddress, version: 1} ))

        const vars = await client.vars.get()
        Transaction.config(vars)

        const payerPrivateKey = await Keypair.fromWords(privateKey.split(' ').filter(w => w.trim()))
        const payee = Address.fromB58(toAddress)
        const payer = payerPrivateKey.address

        const account = await client.accounts.get(fromAddress)
        if(!account || (!account.speculativeNonce && account.speculativeNonce != 0) || !account.balance)
        {
            throw new Error(`[txCreate][account] failed with error:`);
        }
        
        let amountToSend = this.toNativeNumber(amount)
        const nonce = account.speculativeNonce + 1;
        const fee = await this.calculateFee({client, payer, payee, amountToSend, nonce})

        if(subtractFee)
        {
            if(amountToSend.lt(fee))
            {
                throw new Error(`[txCreate] total amount to send is less than fee`)
            }

            amountToSend = amountToSend.minus(fee)
        }

        const balance = new BigNumber(account.balance.integerBalance)

        if(balance.lt(amountToSend.plus(fee)) || balance.lt(amountToSend))
        {
            throw new Error(`[HntProvider][txCreate] insufficient funds to send tx`);
        }

        // construct a payment txn
        const paymentTxn = new PaymentV1({
            payer: payer,
            payee: payee,
            amount: amountToSend.dp(0, 1).toNumber(),
            nonce: nonce,
        })

        const signedPaymentTxn = await paymentTxn.sign({ payer: payerPrivateKey })

        return { data: signedPaymentTxn.toString(), info: paymentTxn };
    }

    async txTransferRaw(options: HeliumTxDataOptions): Promise<string> {
        try {
            const client = new Client(new Network({baseURL: this.rpcAddress, version: 1} ))
            const vars = await client.vars.get()
            Transaction.config(vars)
            const transaction = await client.transactions.submit(options.data)
            return transaction.hash
        } catch (error) {
            throw new Error(`failed with error: ${error}`);
        }
    }

    async txGetSendingResult(txid: string, data?: any): Promise<TransactionSendResult> {
        const client = new Client(new Network({baseURL: this.rpcAddress, version: 1} ))

        try {
            let transaction = await client.transactions.get(txid);

            if(transaction instanceof PaymentV2Transaction){
                if (transaction.height){ return { status: TransactionStatus.sent } };
                return { status: TransactionStatus.pending };
            }

            if(transaction instanceof PaymentV1Transaction)
            {
                if (transaction.height){ return { status: TransactionStatus.sent } };
                return { status: TransactionStatus.pending };
            }

            return { status: TransactionStatus.rejected };   

        } catch (error: any) {

            if(error.response.status == 404)
            {
                try {
                    const pendingTxnsList = await client.pendingTransactions.get(txid)

                    if(pendingTxnsList.data[0].status === 'failed')
                    {
                        return { status: TransactionStatus.rejected };
                    }
                   
                    if(pendingTxnsList.data[0].status === 'pending')
                    {
                        return { status: TransactionStatus.pending };
                    }
                } 
                catch (error) 
                {
                    return { status: TransactionStatus.rejected };         
                }
            }

            return { status: TransactionStatus.rejected };   
        }
    }

    async txGetReceipt(txid: string, params?: any): Promise<any> {
        const client = new Client(new Network({baseURL: this.rpcAddress, version: 1} ))
        const pendingTxnsList = await client.pendingTransactions.get(txid)
        return pendingTxnsList;
    }

    toNativeNumber(base: string | number ): BigNumber {
        return new BigNumber(base).times(10 ** this.decimals);
    }
    
    fromNativeNumber(base: string | number ) {
        return new BigNumber(base).dividedBy(10 ** this.decimals).toString(10);
    }
    
    async calculateFee(options: {client: Client; payer: Address; payee: Address; amountToSend: BigNumber; nonce: number;}): Promise<BigNumber> {
        // construct a PaymentV2 txn for the purpose of calculating the fee
        const paymentTxnForFee = new PaymentV1({
            payer: options.payer,
            payee: options.payee,
            amount: options.amountToSend.toNumber(),
            nonce: options.nonce,
        })
        
        const feeInDC = new Balance(paymentTxnForFee.fee, CurrencyType.dataCredit)
        const oracles = await options.client.oracle.getPredictedPrice()
        // get max price in orcales objects
        const maxPredictedPrice = oracles.reduce((max: any, curr: any) => {
            if(max.price && curr.price)
            {
                return max.price.bigBalance.gt(curr.price.bigBalance) ? max : curr
            }
        })

        const feeInHNT = feeInDC.toNetworkTokens(maxPredictedPrice.price)

        return new BigNumber(feeInHNT.integerBalance)
        .plus(this.addedFeeForTx()) // added lee way fee to remove precision for insufficient funds
    }

    addedFeeForTx(): BigNumber {
        return this.toNativeNumber(0.01) // average fee for a txn 0.01000000
    }
}

const getNakedHexString = (address: string) => (!!address ? address.toLowerCase().replace('0x', '') : '');

export interface HeliumTxOptions extends ProviderTxOptions {}

export interface HeliumTxDataOptions extends TransactonData {}

export default HeliumProvider;