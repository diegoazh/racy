import { LoggerService } from '../services/logger.service';

export abstract class AppException extends Error {
  private logger = new LoggerService('AppException');

  constructor(message: string, stack: string, public status: number) {
    super(message);

    const isProduction = process.env.NODE_ENV === 'production';
    super.stack = isProduction ? '' : stack;

    this.logger.error(
      `${this.message}: ${this.stack} - status: ${this.status}`,
    );
  }

  public toJSON(): Record<string, string | number | undefined> {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      status: this.status,
    };
  }
}
