/**
 * This types should be removed when azure-middleware repository merged
 * the following PR https://github.com/emanuelcasco/azure-middleware/pull/13
 */
import { Context, HttpRequest } from '@azure/functions';

export type AzureHandler<T = void> = (ctx: Context, req: HttpRequest) => T;

export type AzureMiddlewareHandler<T = void> = (reqCtx: ReqCtx) => T;

export type MiddlewareConfiguration = {
  before?: AzureMiddlewareHandler;
  after?: AzureMiddlewareHandler;
  onError?: AzureMiddlewareHandler;
};

export type ReqCtx = {
  ctx: Context;
  req: HttpRequest;
  response?: any;
  error?: any;
};

export type RunCtx = {
  reqCtx: ReqCtx;
  baseHandler: AzureHandler;
  before: AzureMiddlewareHandler[];
  after: AzureMiddlewareHandler[];
  onError: AzureMiddlewareHandler[];
};

export type MiddlewareFnBuilder = (...args: any[]) => MiddlewareConfiguration;
