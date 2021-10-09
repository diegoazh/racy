import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';

export function Middleware(
  middleware: Function | Function[],
): MethodDecorator & ClassDecorator {
  return function middlewareDecorator(
    target: any,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ): void {
    const middlewareToAdd = Array.isArray(middleware)
      ? middleware
      : [middleware];

    if (propertyKey && descriptor) {
      // is a method decorator
      const controllerMethodMetadata: Record<string, any> =
        Reflect.getMetadata(
          AppMetadataKeys.CONTROLLER_METHOD_METADATA,
          target,
          propertyKey,
        ) || {};

      let { middleware: middlewareOnMethod } = controllerMethodMetadata;

      if (Array.isArray(middlewareOnMethod)) {
        middlewareOnMethod = [...middlewareOnMethod, ...middlewareToAdd];
      } else {
        middlewareOnMethod = middlewareToAdd;
      }

      controllerMethodMetadata.middleware = middlewareOnMethod;

      Reflect.defineMetadata(
        AppMetadataKeys.CONTROLLER_METHOD_METADATA,
        controllerMethodMetadata,
        target,
        propertyKey,
      );
    }

    if (!propertyKey && !descriptor) {
      // is a class decorator
      const controllerMetadata: Record<string, any> =
        Reflect.getMetadata(
          AppMetadataKeys.CONTROLLER_METADATA,
          target.prototype,
        ) || {};

      controllerMetadata[target.name] = controllerMetadata[target.name] || {};

      let { middleware: middlewareOnController } =
        controllerMetadata[target.name];

      if (Array.isArray(middlewareOnController)) {
        middlewareOnController = [
          ...middlewareOnController,
          ...middlewareToAdd,
        ];
      } else {
        middlewareOnController = middlewareToAdd;
      }

      controllerMetadata[target.name].middleware = middlewareOnController;

      Reflect.defineMetadata(
        AppMetadataKeys.CONTROLLER_METADATA,
        controllerMetadata,
        target.prototype,
      );
    }
  };
}
