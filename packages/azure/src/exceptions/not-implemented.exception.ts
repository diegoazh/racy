import { HttpStatus } from '../constants/http-status.constant';
import { AppException } from './app.exception';

export class NotImplementedException extends AppException {
  constructor(message = 'not implemented', stack = '') {
    super(message, stack, HttpStatus.NOT_IMPLEMENTED);
    super.name = 'NotImplementedException';
  }
}
