import { HttpStatus } from '../constants/http-status.constant';
import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(message = 'you do not have enough permissions', stack = '') {
    super(message, stack, HttpStatus.UNAUTHORIZED);
    super.name = 'UnauthorizedException';
  }
}
