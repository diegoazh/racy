import { HttpStatus } from '../constants/http-status.constant';
import { AppException } from './app.exception';

export class InternalServerErrorException extends AppException {
  constructor(message = 'internal server error', stack = '') {
    super(message, stack, HttpStatus.INTERNAL_SERVER_ERROR);
    super.name = 'InternalServerErrorException';
  }
}
