import { IProvider } from "./IProvider";
import { ProviderOptions } from "./IProviderOptions";

/**
 * This is the type of the provider. majorly used for intelligent selection of the provider and error checking
 */
export type ProviderOptionsType = 
    [ IProvider.BTC, ProviderOptions.BitcoinOptions] |
    [ IProvider.ETH, ProviderOptions.EtheriumOptions] 
;