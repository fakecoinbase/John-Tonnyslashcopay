import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { md5 }  from 'md5-node';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { shareReplay } from 'rxjs/operators';
import { ConfigProvider, Logger } from '../../providers';
import { CoinsMap, CurrencyProvider } from '../../providers/currency/currency';

export interface ApiPrice {
  ts: number;
  rate: number;
  fetchedOn: number;
}

export interface ApiRatio {
  "code": number;
  "pagePrompt": string;
  "data": {
    "id": string;
    "totalFund": number;
    "totalDisp": number;
    "totalMoney": number;
    "fundValue": number;
    "updateTime": number;
    "createTime": number;
  }
}



@Injectable()
export class ExchangeRatesProvider {
  private bwsURL: string;
  private headers = {};
  private ratesCache:
    | object
    | CoinsMap<{
        1?: Observable<ApiRatio[]>;
        7?: Observable<ApiRatio[]>;
        31?: Observable<ApiRatio[]>;
      }> = {};

  constructor(
    private currencyProvider: CurrencyProvider,
    private httpClient: HttpClient,
    private logger: Logger,
    private configProvider: ConfigProvider
  ) {
    this.logger.debug('ExchangeRatesProvider initialized');
    const defaults = this.configProvider.getDefaults();
    this.bwsURL = defaults.ratio.url;
    try{
      this.headers = {"Auth": '9c7f69dcb2c24532da39bca5a290ff47'}; // this.get_header_auth('jlw', '999000', '13d411b90aac453fb6854eaf3e6232b8'));
    }catch (e){
      this.logger.error('Error getting current rate:', e);
    }
    for (const coin of this.currencyProvider.getAvailableCoins()) {
      this.ratesCache[coin] = {};
    }
  }

  public get_header_auth(name , password, privkey) {
    return md5(name + password + privkey);
  }

  public getLastDayRates(): Promise<any> {
    const isoCode =
      this.configProvider.get().wallet.settings.alternativeIsoCode || 'USD';
    const availableChains = this.currencyProvider.getAvailableChains();
    return new Promise(resolve => {
      let ratesByCoin = {};
      _.forEach(availableChains, coin => {
        this.getHistoricalRates(coin, isoCode).subscribe(
          response => {
            ratesByCoin[coin] = _.last(response).data.fundValue;
          },
          err => {
            this.logger.error('Error getting current rate:', err);
            return resolve(ratesByCoin);
          }
        );
      });
      return resolve(ratesByCoin);
    });
  }

  public getHistoricalRates(
    coin: string,
    isoCode: string,
    force: boolean = false,
    dateOffset = 1
  ): Observable<ApiRatio[]> {
    const observableBatch = [];
    const historicalDates = this.setDates(dateOffset);

    if (!this.ratesCache[coin][dateOffset] || force) {
      _.forEach(historicalDates, date => {
        observableBatch.push(
          this.httpClient.get<ApiRatio>(
            `${this.bwsURL}/fundValue/latest`, {headers: this.headers}
          )
        );
      });
      this.ratesCache[coin][dateOffset] = Observable.forkJoin(
        observableBatch
      ).pipe(shareReplay());
    }
    return this.ratesCache[coin][dateOffset];
  }

  public getCurrentRate(isoCode?, coin?): Observable<ApiRatio> {
    return this.httpClient.get<ApiRatio>(
        `${this.bwsURL}/fundValue/latest`, {headers: this.headers}
    );
    /*return {
      ts: 23432432555,
      rate: ret['data']['fundValue'],
      fetchedOn: 123434324234
    };*/
  }

  private setDates(dateOffset: number): number[] {
    const intervals = 4;
    const today = new Date().getTime();
    const lastDate =
      moment()
        .subtract(dateOffset, 'days')
        .unix() * 1000;
    const historicalDates = [lastDate];
    const intervalOffset = Math.round((today - lastDate) / intervals);

    for (let i = 0; i <= intervals; i++) {
      const intervalTime = historicalDates[i] + intervalOffset;
      if (intervalTime < today) {
        historicalDates.push(intervalTime);
      } else {
        break;
      }
    }
    historicalDates.push(today);
    return historicalDates.reverse();
  }
}
