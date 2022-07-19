import { ICryptoProvider } from "./interfaces/ICryptoProvider";
import { ProviderOptionsType } from "./interfaces/IProviderOptionsType";
import * as Providers from "./providers";

export interface ProviderOptions {}

export async function getCryptoProvider([provider, options ]: ProviderOptionsType) : Promise<ICryptoProvider<any>> 
{ 
    return new Providers[provider](options);
}

console.log(Providers)