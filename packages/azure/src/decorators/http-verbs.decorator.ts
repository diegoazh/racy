import { Context, HttpRequest } from '@azure/functions';
import { AppMetadataKeys } from '@shared/constants/app-metadata-keys.constant';
import { HttpStatus } from '@shared/constants/http-status.constant';
import { HttpVerb } from '@shared/constants/http-verb.constant';
import { AppException } from '@shared/exceptions/app.exception';
import {
  IControllerMetadata,
  IControllerMethodMetadata,
  IControllerParamMetadata,
  IParameterData,
  IParamMethodDefinition,
} from '@shared/interfaces/metadata.interface';
import { IHandlersMetadata } from '@shared/interfaces/module-decorator-options.interface';
import { ConfigService } from '@shared/services/config.service';
import { LoggerService } from '@shared/services/logger.service';
import { ResponseManagerService } from '@shared/services/response-manager.service';
import { UtilService } from '@shared/services/util.service';
import { ValidatorService } from '@shared/services/validator.service';
import { SharedModule } from '@shared/shared.module';
import azureFnLogIntercept from 'azure-function-log-intercept';
import { Container } from 'inversify';

export function Get(route?: string, handlerName?: string): MethodDecorator {
  return function httpGetDecorator<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void | TypedPropertyDescriptor<T> {
    defineHttpVerb(target, propertyKey, HttpVerb.GET);
    addHandlerDefinition(target, propertyKey, handlerName);
    addLogInformation(target, propertyKey, route);
    methodImplementation(target, propertyKey, descriptor);
  };
}

export function Post(route?: string, handlerName?: string): MethodDecorator {
  return function httpGetDecorator<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void | TypedPropertyDescriptor<T> {
    defineHttpVerb(target, propertyKey, HttpVerb.POST);
    addHandlerDefinition(target, propertyKey, handlerName);
    addLogInformation(target, propertyKey, route);
    methodImplementation(target, propertyKey, descriptor);
  };
}

export function Put(route?: string, handlerName?: string): MethodDecorator {
  return function httpGetDecorator<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void | TypedPropertyDescriptor<T> {
    defineHttpVerb(target, propertyKey, HttpVerb.PUT);
    addHandlerDefinition(target, propertyKey, handlerName);
    addLogInformation(target, propertyKey, route);
    methodImplementation(target, propertyKey, descriptor);
  };
}

export function Patch(route?: string, handlerName?: string): MethodDecorator {
  return function httpGetDecorator<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void | TypedPropertyDescriptor<T> {
    defineHttpVerb(target, propertyKey, HttpVerb.PATCH);
    addHandlerDefinition(target, propertyKey, handlerName);
    addLogInformation(target, propertyKey, route);
    methodImplementation(target, propertyKey, descriptor);
  };
}

export function Delete(route?: string, handlerName?: string): MethodDecorator {
  return function httpGetDecorator<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void | TypedPropertyDescriptor<T> {
    defineHttpVerb(target, propertyKey, HttpVerb.DELETE);
    addHandlerDefinition(target, propertyKey, handlerName);
    addLogInformation(target, propertyKey, route);
    methodImplementation(target, propertyKey, descriptor);
  };
}

/**
 * This function helps you to add metadata defining
 * which http verb use this method.
 *
 * @param  {Object} target
 * @param  {string|symbol} propertyKey
 * @param  {string} verbName
 * @returns void
 */
function defineHttpVerb(
  target: Object,
  propertyKey: string | symbol,
  verbName: typeof HttpVerb[keyof typeof HttpVerb],
): void {
  // TODO: add interface for this and all app metadata objects
  const controllerMethodMetadata: Record<string, any> =
    Reflect.getMetadata(
      AppMetadataKeys.CONTROLLER_METHOD_METADATA,
      target,
      propertyKey,
    ) || {};

  controllerMethodMetadata.httpVerb = verbName;

  switch (verbName) {
    case HttpVerb.POST:
      controllerMethodMetadata.httpStatus = HttpStatus.CREATED;
      break;

    case HttpVerb.DELETE:
      controllerMethodMetadata.httpStatus = HttpStatus.NO_CONTENT;
      break;

    default:
      controllerMethodMetadata.httpStatus = HttpStatus.OK;
      break;
  }

  Reflect.defineMetadata(
    AppMetadataKeys.CONTROLLER_METHOD_METADATA,
    controllerMethodMetadata,
    target,
    propertyKey,
  );
}

/**
 * This function helps to create the handler definition for every controller
 * inside of a metadata key that is used by the main module to export all handlers
 * to serverless
 *
 * @param  {Object} target
 * @param  {string|symbol} propertyKey
 * @param  {string} handlerName?
 * @returns void
 */
function addHandlerDefinition(
  target: Object,
  propertyKey: string | symbol,
  handlerName?: string,
): void {
  const slsHandlers: IHandlersMetadata[] =
    Reflect.getMetadata(AppMetadataKeys.SLS_HANDLERS, target) || [];
  slsHandlers.push({
    handlerName: handlerName || propertyKey,
    methodName: propertyKey,
    owner: target.constructor,
  });
  Reflect.defineMetadata(AppMetadataKeys.SLS_HANDLERS, slsHandlers, target);
}

/**
 * This function helps to add metadata for every handler that will be
 * used to print logs when every controller is called.
 *
 * @param  {Object} target
 * @param  {string|symbol} propertyKey
 * @param  {string} route?
 * @returns void
 */
function addLogInformation(
  target: Object,
  propertyKey: string | symbol,
  route?: string,
): void {
  const controllerMethodMetadata: Record<string, any> =
    Reflect.getMetadata(
      AppMetadataKeys.CONTROLLER_METHOD_METADATA,
      target,
      propertyKey,
    ) || {};

  controllerMethodMetadata.route = route || '/';

  Reflect.defineMetadata(
    AppMetadataKeys.CONTROLLER_METHOD_METADATA,
    controllerMethodMetadata,
    target,
    propertyKey,
  );
}

/**
 * This function helps to log the http verb used by this function
 * and the route of this function.
 *
 * @param  {Object} target
 * @param  {string|symbol} propertyKey
 * @param  {TypedPropertyDescriptor<T>} descriptor
 * @returns void
 */
function methodImplementation<T>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
): void {
  const original = descriptor.value as unknown as Function;
  const sharedContainerModule: Container | undefined =
    Reflect.getMetadata(AppMetadataKeys.CONTAINER_MODULE, SharedModule) ||
    undefined;

  if (sharedContainerModule) {
    const LoggerSvc = sharedContainerModule.get(LoggerService);
    const logger = new (LoggerSvc as any)(target.constructor.name);
    const responseManagerService = sharedContainerModule.get(
      ResponseManagerService,
    );
    const utilService = sharedContainerModule.get(UtilService);

    (descriptor as any).value = async function (
      context: Context,
      req: HttpRequest,
    ): Promise<void> {
      try {
        azureFnLogIntercept(context);
        const controllerMetadata: IControllerMetadata | undefined =
          Reflect.getMetadata(AppMetadataKeys.CONTROLLER_METADATA, target) ||
          undefined;

        const controllerMethodMetadata: IControllerMethodMetadata | undefined =
          Reflect.getMetadata(
            AppMetadataKeys.CONTROLLER_METHOD_METADATA,
            target,
            propertyKey,
          ) || undefined;

        const paramData: IControllerParamMetadata = Reflect.getMetadata(
          AppMetadataKeys.CONTROLLER_PARAM,
          target,
          propertyKey,
        );

        mainGlobalDebug(
          controllerMetadata,
          controllerMethodMetadata,
          target.constructor.name,
          req,
          logger,
        );

        let params;

        if (paramData && Object.keys(paramData).length) {
          params = buildParamsForControllerMethods(
            paramData[propertyKey as any],
            req,
            logger,
          );
        }

        const result = await original.apply(this, params);

        context.res = responseManagerService.sendData(
          result,
          controllerMethodMetadata?.httpStatus,
        );

        mainGlobalDebug(controllerMethodMetadata, result, logger);
      } catch (error) {
        globalErrorHandling({
          error,
          context,
          logger,
          utilService,
          responseManagerService,
        });
      }
    };
  }
}

/**
 * This is the main global error handling in the application
 * It controls all errors thrown by controllers to define how
 * they should be sent to the user.
 *
 * @param {Object} obj - An object.
 * @param  {*} obj.error - The error thrown by the application
 * @param  {Object} obj.context - The Azure Context object for Azure functions
 * @param  {Object} obj.logger - A LoggerService instance
 * @param  {Object} obj.utilService - A UtilService instance
 * @param  {Object} obj.responseManagerService - A ResponseManagerService instance
 * @returns void
 */
function globalErrorHandling({
  error,
  context,
  logger,
  utilService,
  responseManagerService,
}: {
  error: any;
  context: Context;
  logger: InstanceType<typeof LoggerService>;
  utilService: InstanceType<typeof UtilService>;
  responseManagerService: InstanceType<typeof ResponseManagerService>;
}): void {
  if (!(error instanceof AppException)) {
    let msg = 'UnexpectedError';
    const err = utilService.handleAxiosError(error);

    if (error.request || error.response) {
      msg = 'AxiosError';
    }

    if (error.sql) {
      msg = 'SqlError';
    }

    logger.error(`${msg} 💥`);
    utilService.print(err);
    logger.error(`${err} 💥`);

    if (error.sql) {
      utilService.print('SQL query: 👇');
      utilService.print(error.sql);
      utilService.print('SQL parameters: 👇');
      utilService.print(error.parameters);
    }
  }

  context.res = responseManagerService.sendError(error);
}

/**
 * This function helps to log the the incoming request and
 * the out coming response when app.debug is true in the
 * node config file.
 *
 * @param  {IControllerMetadata|undefined} ctrlMetadata
 * @param  {IControllerMethodMetadata|undefined} methodMetadata
 * @param  {string} targetConstructorName - name of the controller class
 * @param  {HttpRequest} req
 * @param  {InstanceType<typeofLoggerService>} logger
 * @returns void
 */
function mainGlobalDebug(
  ctrlMetadata: IControllerMetadata | undefined,
  methodMetadata: IControllerMethodMetadata | undefined,
  targetConstructorName: string,
  req: HttpRequest,
  logger: InstanceType<typeof LoggerService>,
): void;
/**
 *  * This function helps to log the the incoming request and
 * the out coming response when app.debug is true in the
 * node config file.
 *
 * @param  {IControllerMethodMetadata|undefined} methodMetadata
 * @param  {Record<string} result
 * @param  {} any>|any[]|number|string|boolean
 * @param  {InstanceType<typeofLoggerService>} logger
 * @returns void
 */
function mainGlobalDebug(
  methodMetadata: IControllerMethodMetadata | undefined,
  result: Record<string, any> | any[] | number | string | boolean,
  logger: InstanceType<typeof LoggerService>,
): void;
function mainGlobalDebug(
  ...params: (
    | IControllerMetadata
    | IControllerMethodMetadata
    | HttpRequest
    | any
  )[]
): void {
  const sharedContainerModule: Container | undefined = Reflect.getMetadata(
    AppMetadataKeys.CONTAINER_MODULE,
    SharedModule,
  );

  const utilService = sharedContainerModule?.get(UtilService);
  const configService = sharedContainerModule?.get(ConfigService);
  const appDebug = configService?.get<boolean>('app.debug');

  if (params.length === 5) {
    const [ctrlMetadata, methodMetadata, targetConstructorName, req, logger] =
      params as [
        IControllerMetadata,
        IControllerMethodMetadata,
        string,
        HttpRequest,
        InstanceType<typeof LoggerService>,
      ];

    let baseRoute;
    let httpVerb;
    let route;

    if (ctrlMetadata) {
      ({ baseRoute = '/unknown' } = ctrlMetadata[targetConstructorName]);
    }

    if (methodMetadata) {
      ({ httpVerb, route } = methodMetadata);
    }

    if (appDebug) {
      logger.info(
        `[${httpVerb}] /${baseRoute}/${route} - ${new Date().toISOString()}`.replace(
          /\/\//gim,
          '/',
        ),
      );
      logger.info('Incoming request:');
      utilService?.print(req);
    }
  }

  if (params.length === 3) {
    let httpStatus;

    const [methodMetadata, result, logger] = params as [
      IControllerMethodMetadata,
      Record<string, any> | any[] | number | string | boolean,
      InstanceType<typeof LoggerService>,
    ];

    if (methodMetadata) {
      ({ httpStatus } = methodMetadata);
    }

    if (appDebug) {
      logger.info(`Response sent - status: [${httpStatus}] `);
      utilService?.print(result);
    }
  }
}

/**
 * This function helps you to build the params expected for every controller method
 * using the metadata saved by decorators like Get, Controller, etc.
 *
 * @param  {IParamMethodDefinition} paramDefinition
 * @param  {HttpRequest} req
 * @returns any
 */
function buildParamsForControllerMethods(
  paramDefinition: IParamMethodDefinition,
  req: HttpRequest,
  logger: InstanceType<typeof LoggerService>,
): any[] {
  const sharedContainerModule: Container | undefined = Reflect.getMetadata(
    AppMetadataKeys.CONTAINER_MODULE,
    SharedModule,
  );
  const validatorService = sharedContainerModule?.get(ValidatorService);
  const utilService = sharedContainerModule?.get(UtilService);
  const params: any[] = [];

  Object.values(paramDefinition).forEach((value: IParameterData) => {
    let tempValue = { ...req[value.reqKey] };
    let param;

    if (value.reqKey === 'query') {
      tempValue = utilService?.queryParser(req[value.reqKey]);
      logger.info('Request Query: 👇');
      utilService?.print(tempValue);
    }

    if (value.keys && Array.isArray(value.keys)) {
      param = value.keys.reduce((acc, selectedKey, currentIndex) => {
        acc[currentIndex] = buildNestedKeys(selectedKey, tempValue);

        return acc;
      }, {} as Record<string, any>);
    }

    if (value.keys && typeof value.keys === 'string') {
      param = buildNestedKeys(value.keys, tempValue);
    } else {
      param = tempValue;
    }

    params[value.index] = param;
  });

  for (const value of Object.values(paramDefinition) as IParameterData[]) {
    if (value.reqKey === 'body') {
      params[value.index] = validatorService?.validate(value.type as any, {
        ...params[value.index],
      });

      if (!(params[value.index] instanceof value.type)) {
        throw params[value.index];
      }
    }
  }

  return params;
}

/**
 * This function helps to find nested keys inside of
 * query string object and return the value of the found
 * nested key
 *
 * @param  {string} keys
 * @param  {Record<string, any>} sourceObject
 * @returns any
 */
function buildNestedKeys(keys: string, sourceObject: Record<string, any>): any {
  let finalKey: string | string[] = keys;

  if (typeof finalKey === 'string' && /\./.test(finalKey)) {
    finalKey = finalKey.split('.');

    return finalKey.reduce((finalValue, key) => sourceObject[key], {} as any);
  }

  if (sourceObject[finalKey] && typeof sourceObject[finalKey] === 'string') {
    return sourceObject[finalKey]?.trim();
  }

  return sourceObject[finalKey];
}
