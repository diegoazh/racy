import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';
import {
  IControllerParamMetadata,
  IParameterData,
} from '../interfaces/metadata.interface';

export function Body(keys?: string | string[]): ParameterDecorator {
  return function bodyDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'body', keys);
  };
}

export function Headers(keys?: string | string[]): ParameterDecorator {
  return function headersDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'headers', keys);
  };
}

export function Method(keys?: string | string[]): ParameterDecorator {
  return function methodDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'method', keys);
  };
}

export function Params(keys?: string | string[]): ParameterDecorator {
  return function paramsDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'params', keys);
  };
}

export function Query(keys?: string | string[]): ParameterDecorator {
  return function queryDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'query', keys);
  };
}

export function RawBody(keys?: string | string[]): ParameterDecorator {
  return function rawBodyDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'rawBody', keys);
  };
}

export function Url(keys?: string | string[]): ParameterDecorator {
  return function urlDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    saveParameterMetadata(target, propertyKey, parameterIndex, 'url', keys);
  };
}

function saveParameterMetadata(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
  reqKey:
    | 'body'
    | 'headers'
    | 'method'
    | 'params'
    | 'query'
    | 'rawBody'
    | 'url',
  keys?: string | string[],
): void {
  const paramTypes: Function[] =
    Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
  const paramTypeNames = paramTypes.map((paramType) => paramType.name);

  // TODO: add interface to this object
  const paramData: IControllerParamMetadata =
    Reflect.getMetadata(
      AppMetadataKeys.CONTROLLER_PARAM,
      target,
      propertyKey,
    ) || {};
  const data: Partial<IParameterData> = {};

  if (keys) {
    data.keys = keys;
  }

  data.index = parameterIndex;
  data.reqKey = reqKey;
  data.type = paramTypes[parameterIndex];
  data.typeName = paramTypeNames[parameterIndex];

  paramData[propertyKey as any] = paramData[propertyKey as any] || {};
  paramData[propertyKey as any][parameterIndex] =
    paramData[propertyKey as any][parameterIndex] || {};

  paramData[propertyKey as any][parameterIndex] = {
    ...paramData[propertyKey as any][parameterIndex],
    ...data,
  };

  Reflect.defineMetadata(
    AppMetadataKeys.CONTROLLER_PARAM,
    paramData,
    target,
    propertyKey,
  );
}
