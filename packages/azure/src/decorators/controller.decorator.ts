import { injectable } from 'inversify';
import { AppMetadataKeys } from 'src/constants';
import {
  IControllerMetadata,
  ISingleControllerMetadata,
} from 'src/interfaces/metadata.interface';

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
    const controllerMetadata: IControllerMetadata =
      Reflect.getMetadata(
        AppMetadataKeys.CONTROLLER_METADATA,
        target.prototype,
      ) || {};

    if (!controllerMetadata[target.name]) {
      controllerMetadata[target.name] = {} as ISingleControllerMetadata;
    }

    controllerMetadata[target.name].baseRoute = baseRoute;

    Reflect.defineMetadata(
      AppMetadataKeys.CONTROLLER_METADATA,
      controllerMetadata,
      target.prototype,
    );

    return injectable()(target);
  };
}
