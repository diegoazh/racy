import { AppMetadataKeys } from '../constants/metadata-keys.constant';
import {
  IControllerMetadata,
  IControllerMethodMetadata,
  ISingleControllerMetadata,
} from '../interfaces/metadata.interface';

export function IsPublic(
  target: any,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<any>,
): void {
  if (propertyKey && descriptor) {
    // is a method decorator
    const controllerMethodMetadata: IControllerMethodMetadata =
      Reflect.getMetadata(AppMetadataKeys.IS_PUBLIC, target, propertyKey) || {};

    controllerMethodMetadata.isPublic = true;

    Reflect.defineMetadata(
      AppMetadataKeys.IS_PUBLIC,
      controllerMethodMetadata,
      target,
      propertyKey,
    );
  }

  if (!propertyKey && !descriptor) {
    // is a class decorator
    const controllerMetadata: IControllerMetadata =
      Reflect.getMetadata(AppMetadataKeys.IS_PUBLIC, target.prototype) ||
      ({} as IControllerMetadata);

    controllerMetadata[target.name] =
      controllerMetadata[target.name] || ({} as ISingleControllerMetadata);

    controllerMetadata[target.name].isPublic = true;

    Reflect.defineMetadata(
      AppMetadataKeys.IS_PUBLIC,
      controllerMetadata,
      target.prototype,
    );
  }
}
