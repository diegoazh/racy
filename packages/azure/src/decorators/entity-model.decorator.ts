import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';

export function EntityModel(): ClassDecorator {
  return function modelDecorator<TFunction extends Function>(
    target: TFunction,
  ): TFunction | void {
    Reflect.defineMetadata(AppMetadataKeys.APP_MODEL, true, target);
  };
}
