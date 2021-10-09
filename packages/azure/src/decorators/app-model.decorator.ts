import { inject } from 'inversify';
import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';
import { AppModelDecoratorException } from '../exceptions/app-model-decorator.exception';

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
