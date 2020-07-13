import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';
import { Logger } from '../../providers/logger/logger';

export interface CoinNetwork {
  coin: string;
  network: string;
}
@Injectable()
export class AddressProvider {
  private bitcore;
  private bitcoreCash;
  private vircle;

  constructor(private bwcProvider: BwcProvider, private logger: Logger) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    this.vircle = this.bwcProvider.getVircle();
  }

  public translateToCashAddress(addressToTranslate: string): string {
    var addressObj = this.bitcore.Address(addressToTranslate).toObject();
    const cashAdrr = this.bitcoreCash.Address.fromObject(
      addressObj
    ).toCashAddress();
    this.logger.info(`converted: ${addressToTranslate} -> ${cashAdrr}`);
    return cashAdrr;
  }

  public extractAddress(str: string): string {
    const extractedAddress = str.replace(/^[a-z]+:/i, '').replace(/\?.*/, '');
    return extractedAddress;
  }

  public getCoinAndNetwork(
    str: string,
    network: string = 'livenet'
  ): CoinNetwork {
    const address = this.extractAddress(str);
    try {
      network = this.vircle.Address(address).network.name;
      return { coin: 'vcl', network };
    } catch (e) {
      return null;
    }
  }

  public isValid(str: string): boolean {
    if (!str) return false;
    // Check if the input is a valid uri or address

    const URIVircle = this.vircle.URI;
    const AddressVircle = this.vircle.Address;

    // Bip21 uri
    if (URIVircle.isValid(str)) return true;

    // Regular Address: try Bitcoin and Bitcoin Cash
    if (AddressVircle.isValid(str, 'livenet')) return true;
    if (AddressVircle.isValid(str, 'testnet')) return true;

    return false;
  }

  public getLegacyBchAddressFormat(addr: string): string {
    const a = this.bitcoreCash.Address(addr).toObject();
    return this.bitcore.Address.fromObject(a).toString();
  }
}
