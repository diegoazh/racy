import { AppMetadataKeys, HttpStatus } from 'src/constants';
import { IControllerMethodMetadata } from 'src/interfaces/metadata.interface';

export function HttpCode(
  httpStatus: typeof HttpStatus[keyof typeof HttpStatus],
): MethodDecorator {
  return function httpCode<T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>, // eslint-disable-line @typescript-eslint/no-unused-vars -- temporary
  ): void | TypedPropertyDescriptor<T> {
    const controllerMethodMetadata: IControllerMethodMetadata =
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
