import { HttpStatus } from '../constants/http-status.constant';
import { Injectable } from '../decorators';
import { AppException } from '../exceptions/app.exception';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';
import { IAppResponse } from '../interfaces/app-responses.interface';

@Injectable()
export class ResponseManagerService {
  public sendError(error: AppException | Error): IAppResponse<string> {
    if (error instanceof Error && !(error instanceof AppException)) {
      const internalError = new InternalServerErrorException(
        error.message,
        error.stack,
      );

      return {
        status: internalError.status,
        body: JSON.stringify(internalError),
      };
    }

    if (!(error instanceof Error)) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: error,
      };
    }

    return {
      status: error.status,
      body: JSON.stringify(error),
    };
  }

  public sendData<T>(
    body: T,
    status: typeof HttpStatus[keyof typeof HttpStatus] = 200,
  ): IAppResponse<T> {
    return {
      status,
      body,
    };
  }
}
