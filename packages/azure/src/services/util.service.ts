import { HttpRequestQuery } from '@azure/functions';
import { AxiosError } from 'axios';
import config from 'config';
import qs from 'qs';
import { inspect } from 'util';
import { Injectable } from '../decorators';
import { IQueryParserResult } from '../interfaces/query-parser-result.interface';

@Injectable()
export class UtilService {
  public queryParser(query: HttpRequestQuery): IQueryParserResult {
    const { pageIndex = 0, pageSize = 0, ...filterQuery } = query;

    const result = qs.parse(qs.stringify(filterQuery)) as any;

    return {
      pageSize: +pageSize,
      pageIndex: +pageIndex,
      filter: {},
      ...result,
    };
  }

  public handleAxiosError(error: AxiosError | any): any {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return error.response.data;
    }

    if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      return error.request;
    }

    if (error.message) {
      // Something happened in setting up the request that triggered an Error
      return error.message;
    }

    return error;
  }

  print(obj: any, showHidden = false, depth = 7, color = true): void {
    if (config.get<boolean>('server.debug')) {
      global.console.debug(inspect(obj, showHidden, depth, color));
    }
  }
}
