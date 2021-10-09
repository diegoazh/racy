import { injectable } from 'inversify';
import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';
import { InjectableType } from '../constants/injectable-type.constant';

export function Injectable(
  type: typeof InjectableType[keyof typeof InjectableType] = InjectableType.SERVICE,
): ClassDecorator {
  return function injectableDecorator<TFunction extends Function>(
    target: TFunction,
  ): void | TFunction {
    Reflect.defineMetadata(AppMetadataKeys.APP_PROVIDER, true, target);
    Reflect.defineMetadata(AppMetadataKeys.BINDING_TYPE, type, target);
    injectable()(target);
  };
}
