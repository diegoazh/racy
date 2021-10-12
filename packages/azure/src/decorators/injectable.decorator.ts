import { injectable } from 'inversify';
import { InjectableType } from '../constants/injectable-type.constant';
import { AppMetadataKeys } from '../constants/metadata-keys.constant';

export function Injectable(type: typeof InjectableType[keyof typeof InjectableType]): ClassDecorator;
export function Injectable<TFunction extends Function>(target: TFunction): void | TFunction;
export function Injectable<TFunction extends Function>(
  arg: any,
): ClassDecorator | void | TFunction {
  if (typeof arg === 'function') {
    Reflect.defineMetadata(AppMetadataKeys.APP_PROVIDER, true, arg);
    Reflect.defineMetadata(AppMetadataKeys.BINDING_TYPE, InjectableType.SERVICE, arg);
    injectable()(arg);
  } else {
    return function injectableDecorator<UFunction extends Function>(
      target: UFunction,
    ): void | UFunction {
      Reflect.defineMetadata(AppMetadataKeys.APP_PROVIDER, true, target);
      Reflect.defineMetadata(AppMetadataKeys.BINDING_TYPE, arg, target);
      injectable()(target);
    };
  }
}
