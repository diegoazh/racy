import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';
import { HttpStatus } from '../constants/http-status.constant';

export function HttpCode(
  httpStatus: typeof HttpStatus[keyof typeof HttpStatus],
): MethodDecorator {
  return function httpCode<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>, // eslint-disable-line @typescript-eslint/no-unused-vars -- temporary
  ): void | TypedPropertyDescriptor<T> {
    const controllerMethodMetadata: Record<string, any> =
      Reflect.getMetadata(
        AppMetadataKeys.CONTROLLER_METHOD_METADATA,
        target,
        propertyKey,
      ) || {};

    controllerMethodMetadata.httpStatus = httpStatus;

    Reflect.defineMetadata(
      AppMetadataKeys.CONTROLLER_METHOD_METADATA,
      controllerMethodMetadata,
      target,
      propertyKey,
    );
  };
}
