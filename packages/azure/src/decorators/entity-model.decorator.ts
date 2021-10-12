import { AppMetadataKeys } from 'src/constants';

/**
 * This function allow you to identify the sequelize models classes
 * It returns a ClassDecorator function
 *
 * @returns ClassDecorator
 */
export function EntityModel(): ClassDecorator;
/**
 * This function allow you to identify the sequelize models classes
 * It is the ClassDecorator function
 *
 * @param  {TFunction} target
 * @returns TFunction
 */
export function EntityModel<TFunction extends Function>(
  target: TFunction,
): TFunction | void;
export function EntityModel<T extends Function>(
  arg?: T,
): ClassDecorator | T | void {
  if (!arg) {
    return function modelDecorator<TFunction extends Function>(
      target: TFunction,
    ): TFunction | void {
      Reflect.defineMetadata(AppMetadataKeys.APP_MODEL, true, target);
    };
  }

  Reflect.defineMetadata(AppMetadataKeys.APP_MODEL, true, arg);
}
