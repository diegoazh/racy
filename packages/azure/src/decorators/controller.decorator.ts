import { injectable } from 'inversify';
import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';

/**
 * Controller decorator factory
 * It add metadata to define the base route of the controller
 * and decorate the class with the inject decorator of inversify
 *
 * @param  {string} baseRoute
 * @returns ClassDecorator
 */
export function Controller(baseRoute: string): ClassDecorator {
  return function controllerDecorator<TFunction extends Function>(
    target: TFunction,
  ): void | TFunction {
    const controllerMetadata: Record<string, any> =
      Reflect.getMetadata(
        AppMetadataKeys.CONTROLLER_METADATA,
        target.prototype,
      ) || {};
    controllerMetadata[target.name] = controllerMetadata[target.name] || {};
    controllerMetadata[target.name].baseRoute = baseRoute;
    Reflect.defineMetadata(
      AppMetadataKeys.CONTROLLER_METADATA,
      controllerMetadata,
      target.prototype,
    );
    return injectable()(target);
  };
}
