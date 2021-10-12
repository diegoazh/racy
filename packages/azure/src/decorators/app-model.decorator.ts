import { inject } from 'inversify';
import { AppMetadataKeys } from 'src/constants';
import { AppModelDecoratorException } from 'src/exceptions';

/**
 * This function helps you to inject a sequelize model
 * as a parameter of your services
 *
 * @param  {Function | (new (...args: any[]) => T} model
 * @returns ParamDecorator
 */
export function AppModel<T extends Function | (new (...args: any[]) => T)>(
  model: T,
): (
  target: any,
  targetKey: string,
  index?: number | PropertyDescriptor | undefined,
) => void {
  if (!Reflect.getMetadata(AppMetadataKeys.APP_MODEL, model)) {
    throw new AppModelDecoratorException(model);
  }

  return inject(model.name);
}
