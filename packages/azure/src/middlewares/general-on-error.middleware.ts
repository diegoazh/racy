import {
  AzureMiddlewareHandler,
  MiddlewareConfiguration,
  ReqCtx,
} from '@racy/azure-middleware/types';
import { ResponseManagerService } from 'src/services';

export function generalOnErrorMiddleware(): MiddlewareConfiguration {
  const onError: AzureMiddlewareHandler = (reqCtx: ReqCtx) => {
    reqCtx.response = new ResponseManagerService().sendError(reqCtx.error);
  };

  return { onError };
}
