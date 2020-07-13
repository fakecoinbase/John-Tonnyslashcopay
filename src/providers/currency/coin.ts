import { CoinsMap } from './currency';

export interface CoinOpts {
  // Bitcore-node
  name: string;
  chain: string;
  coin: string;
  unitInfo: {
    // Config/Precision
    unitName: string;
    unitToSatoshi: number;
    unitDecimals: number;
    unitCode: string;
  };
  properties: {
    // Properties
    hasMultiSig: boolean;
    hasMultiSend: boolean;
    isUtxo: boolean;
    isERCToken: boolean;
    isStableCoin: boolean;
    singleAddress: boolean;
  };
  paymentInfo: {
    paymentCode: string;
    protocolPrefix: { livenet: string; testnet: string };
    // Urls
    ratesApi: string;
    blockExplorerUrls: string;
  };
  feeInfo: {
    // Fee Units
    feeUnit: string;
    feeUnitAmount: number;
    blockTime: number;
    maxMerchantFee: string;
  };
  theme: {
    backgroundColor: string;
    gradientBackgroundColor: string;
  };
}

export const availableCoins: CoinsMap<CoinOpts> = {
  vcl: {
    name: 'Vircle',
    chain: 'VCL',
    coin: 'vcl',
    unitInfo: {
      unitName: 'VCL',
      unitToSatoshi: 100000000,
      unitDecimals: 8,
      unitCode: 'vcl'
    },
    properties: {
      hasMultiSig: true,
      hasMultiSend: true,
      isUtxo: true,
      isERCToken: false,
      isStableCoin: false,
      singleAddress: false
    },
    paymentInfo: {
      paymentCode: 'BIP73',
      protocolPrefix: { livenet: 'vcl', testnet: 'vcltest' },
      ratesApi: 'http://47.105.77.95:8081/fundValue/latest',
      blockExplorerUrls: 'bws.vircle.xyz:1443//#/VCL/'
    },
    feeInfo: {
      feeUnit: 'sat/byte',
      feeUnitAmount: 1000,
      blockTime: 10,
      maxMerchantFee: 'normal'
    },
    theme: {
      backgroundColor: '#2fcf6e',
      gradientBackgroundColor: '#2fcf6e'
    }
  },
};
