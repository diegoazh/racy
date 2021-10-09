import { plainToClass } from 'class-transformer';
import { Validator } from 'class-validator';
import { inspect } from 'util';
import { Injectable } from '../decorators';
import { LoggerService } from './logger.service';

type Constructor<T> = { new (): T };

@Injectable()
export class ValidatorService {
  private logger = new LoggerService('ValidatorService');

  // This function returns a middleware which validates that the
  // request's JSON body conforms to the passed-in type.
  public validate<T>(
    type: Constructor<T>,
    plain: Record<string, any>,
  ): Record<string, string> | T {
    const validator = new Validator();

    this.logger.info(`type: ${type}`);
    this.logger.info(`plain: ${inspect(plain, false, 7, true)}`);

    const input = plainToClass(type, plain);

    this.logger.info(`input: ${inspect(input, false, 7, true)}`);

    const errors = validator.validateSync(input as Record<string, any>);

    if (errors.length > 0) {
      return errors.reduce(
        (acc, validationError) => ({
          ...acc,
          [validationError.property]: Object.values(
            validationError.constraints as any,
          ).reduce(
            (text, value) => (text ? `${text} and ${value}` : value),
            '',
          ),
        }),
        {},
      );
    }

    return input;
  }
}
