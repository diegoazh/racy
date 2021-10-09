import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from 'axios';
import { Injectable } from '../decorators';
import { ConfigService } from './config.service';

@Injectable()
export class HttpService {
  constructor(
    private $baseUrl = '',
    private httpClient: AxiosStatic | AxiosInstance = axios,
    private configService: ConfigService,
  ) {
    if (httpClient) {
      this.httpClient = httpClient;
    }

    if (!httpClient && this.configService.has('baseUrl')) {
      this.baseUrl = this.configService.get('baseUrl');
    }
  }

  public get baseUrl(): string {
    return this.$baseUrl;
  }

  public set baseUrl(uri: string) {
    if (uri) {
      this.$baseUrl = uri;
    }
  }

  public get<T>(
    uri: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const finalUri = this.checkAbsoluteUri(uri);

    return this.httpClient.get<T>(finalUri, config);
  }

  public post<T, D = any>(
    uri: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const finalUri = this.checkAbsoluteUri(uri);

    return this.httpClient.post<T>(finalUri, data, config);
  }

  public put<T, D = any>(
    uri: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const finalUri = this.checkAbsoluteUri(uri);

    return this.httpClient.put<T>(finalUri, data, config);
  }

  public patch<T, D = any>(
    uri: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const finalUri = this.checkAbsoluteUri(uri);

    return this.httpClient.patch<T>(finalUri, data, config);
  }

  public delete<T>(
    uri: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const finalUri = this.checkAbsoluteUri(uri);

    return this.httpClient.delete<T>(finalUri, config);
  }

  private checkAbsoluteUri(uri: string): string {
    if (/^http(s?):\/\/.+/.test(uri)) {
      return uri;
    }

    if (/^\/.+/.test(uri)) {
      return `${this.$baseUrl}${uri}`;
    }

    return `${this.$baseUrl}/${uri}`;
  }
}
