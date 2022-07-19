import { ICryptoProvider } from "./interfaces/ICryptoProvider";
import { ProviderOptionsType } from "./interfaces/IProviderOptionsType";
import * as Providers from "./providers";
import { IProvider } from "./interfaces/IProvider";

export { IProvider }

export async function getCryptoProvider([provider, options ]: ProviderOptionsType) : Promise<ICryptoProvider<any>> 
{ 
    return new Providers[provider](options);
}