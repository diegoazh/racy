import { HttpStatus } from '../constants/http-status.constant';
import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(message = 'nothing was found', stack = '') {
    super(message, stack, HttpStatus.NOT_FOUND);
    super.name = 'NotFoundException';
  }
}
