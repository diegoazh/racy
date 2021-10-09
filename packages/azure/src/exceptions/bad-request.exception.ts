import { HttpStatus } from '../constants/http-status.constant';
import { AppException } from './app.exception';

export class BadRequestException extends AppException {
  constructor(message = 'bad request, please check it', stack = '') {
    super(message, stack, HttpStatus.BAD_REQUEST);
    super.name = 'BadRequestException';
  }
}
