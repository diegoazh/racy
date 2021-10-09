import { HttpStatus } from '../constants/http-status.constant';
import { AppException } from './app.exception';

export class ConflictException extends AppException {
  constructor(
    message = 'A resource with the same value already exists',
    stack = '',
  ) {
    super(message, stack, HttpStatus.CONFLICT);
    super.name = 'ConflictException';
  }
}
