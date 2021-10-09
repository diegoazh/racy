import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  AzureHandler,
  AzureMiddlewareHandler,
  MiddlewareConfiguration,
  ReqCtx,
  RunCtx,
} from './types/azure-middleware.type';

export class AzureMiddleware {
  private before: AzureMiddlewareHandler[] = [];

  private after: AzureMiddlewareHandler[] = [];

  private onError: AzureMiddlewareHandler[] = [];

  public middlewareCollection: {
    before: AzureMiddlewareHandler[];
    after: AzureMiddlewareHandler[];
    onError: AzureMiddlewareHandler[];
  } = {
    before: [],
    after: [],
    onError: [],
  };

  constructor(private baseHandler: AzureHandler) {
    this.middlewareCollection = {
      before: this.before,
      after: this.after,
      onError: this.onError,
    };
  }

  public use(
    middlewareCases: MiddlewareConfiguration | MiddlewareConfiguration[],
  ): this {
    if (Array.isArray(middlewareCases)) {
      for (const middleware of middlewareCases) {
        this.saveMiddlewareByCase(middleware);
      }

      return this;
    }

    return this.saveMiddlewareByCase(middlewareCases);
  }

  public saveMiddlewareByCase(middleware: MiddlewareConfiguration): this {
    const { before, after, onError } = middleware;

    if (!before && !after && !onError) {
      throw new Error(
        'Middleware must be an object containing at least one key among "before", "after", "onError"',
      );
    }

    if (before) this.addBefore(before);
    if (after) this.addAfter(after);
    if (onError) this.addOnError(onError);

    return this;
  }

  public addBefore(beforeMiddleware: AzureMiddlewareHandler): this {
    this.before.push(beforeMiddleware);

    return this;
  }

  public addAfter(afterMiddleware: AzureMiddlewareHandler): this {
    this.after.push(afterMiddleware);

    return this;
  }

  public addOnError(onErrorMiddleware: AzureMiddlewareHandler): this {
    this.onError.push(onErrorMiddleware);

    return this;
  }

  public async executeMiddlewareCollection(
    reqCtx: ReqCtx,
    middlewareCollection: AzureMiddlewareHandler[],
    options: { isAfter: boolean } = { isAfter: false },
  ): Promise<void> {
    const { isAfter = false } = options;

    for (const nextMiddleware of isAfter
      ? middlewareCollection.reverse()
      : middlewareCollection) {
      const res = await nextMiddleware?.(reqCtx);

      // short circuit chaining and respond early
      if (res !== undefined) {
        reqCtx.response = res;
        return;
      }
    }
  }

  public async run({
    reqCtx,
    baseHandler,
    before,
    after,
    onError,
  }: RunCtx): Promise<
    | {
        [key: string]: any;
      }
    | undefined
  > {
    try {
      await this.executeMiddlewareCollection(reqCtx, before);

      // Check if before stack hasn't exit early
      if (reqCtx.response == null) {
        reqCtx.response = await baseHandler(reqCtx.ctx, reqCtx.req);
        await this.executeMiddlewareCollection(reqCtx, after, {
          isAfter: true,
        });
      }
    } catch (err: any) {
      // Reset response changes made by after stack before error thrown
      reqCtx.response = undefined;
      reqCtx.error = err;

      try {
        await this.executeMiddlewareCollection(reqCtx, onError);
      } catch (error: any) {
        // Save error that wasn't handled
        error.originalError = reqCtx.error;
        reqCtx.error = error;

        return (reqCtx.ctx.res = reqCtx.error);
      }

      // Catch if onError stack hasn't handled the error
      if (reqCtx.response == null) {
        return (reqCtx.ctx.res = reqCtx.error);
      }
    }

    return (reqCtx.ctx.res = reqCtx.response);
  }

  public listen(): AzureFunction {
    return async (ctx: Context, req: HttpRequest): Promise<void> => {
      const reqCtx: ReqCtx = {
        ctx,
        req,
        response: undefined,
        error: undefined,
      };
      const runCtx = {
        reqCtx,
        baseHandler: this.baseHandler,
        before: this.before,
        after: this.after,
        onError: this.onError,
      };

      await this.run(runCtx);
    };
  }
}
