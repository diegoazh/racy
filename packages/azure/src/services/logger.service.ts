import path from 'path';
import { createLogger, format, Logger, transports } from 'winston';
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from 'winston/lib/winston/transports';
import { InjectableType } from '../constants/injectable-type.constant';
import { Injectable } from '../decorators';

@Injectable(InjectableType.CONSTRUCTOR)
export class LoggerService {
  private level = 'debug';

  private levelColors: Record<string, string> = {
    emerg: '\x1b[1;91m',
    alert: '\x1b[1;93m',
    crit: '\x1b[1;94m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    notice: '\x1b[35m',
    info: '\x1b[36m',
    debug: '\x1b[37m',
  };

  private myFormat = format.printf(({ level, message, label, timestamp }) => {
    const resetColor = '\x1b[0m';

    return `${
      this.levelColors[level] || ''
    }[${timestamp}]${resetColor} ${label} ${
      this.levelColors[level] || ''
    }[${level}]${resetColor}: ${message} - ${this.getLineInfo()}`;
  });

  private winstonLevels = {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
  };

  private logger: Logger;

  /**
   * You construct a logger for with a specific label
   * this is very useful to identify the file that fires
   * the log output
   * @param  {string} privatelabel
   * @param  {string} level?
   * @example new LoggerService('ClassName');
   */
  constructor(private label: string, private stackLevel = 0, level?: string) {
    const loggerTransforms: (
      | FileTransportInstance
      | ConsoleTransportInstance
    )[] = [];

    if (process.env.LOGGER_LEVEL) {
      this.level = process.env.LOGGER_LEVEL;
    } else if (level) {
      this.level = level;
    }

    if (
      process.env.HAPPYOUT_LOGS_TO_FILE &&
      +process.env.HAPPYOUT_LOGS_TO_FILE
    ) {
      loggerTransforms.push(
        // - Write all logs error (and below) to `happyout-error.log`.
        new transports.File({
          filename: `${process.env.HAPPYOUT_ERROR_LOG || 'happyout-error.log'}`,
          level: 'error',
        }),
      );

      loggerTransforms.push(
        // - Write to all logs with level `info` and below to `happyout-combined.log`.
        new transports.File({
          filename: `${
            process.env.HAPPYOUT_COMBINED_LOG || 'happyout-combined.log'
          }`,
        }),
      );
    }

    loggerTransforms.push(new transports.Console());

    this.logger = createLogger({
      level: this.level,
      levels: this.winstonLevels,
      format: format.combine(
        format.label({ label: this.label }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        this.myFormat,
      ),
      defaultMeta: { service: 'your-service-name' },
      transports: [...loggerTransforms],
    });
  }

  /**
   * This is the common log, is for debugger purposes
   * but if you want you can change the level of the log
   * adding a new level to it
   * @param  {string} message
   * @param  {} level='debug'
   * @returns void
   * @example loggerService.log('my message'); || loggerService.log('my message', 'error');
   */
  log(message: string | Record<string, any>, level = 'debug'): void {
    this.logger.log(
      level,
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a info log it is to share information
   * across the application.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  info(message: string | Record<string, any>): void {
    this.logger.info(
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a notice log it is to share a more important message
   * across the application.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  notice(message: string | Record<string, any>): void {
    this.logger.notice(
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a warning log it is to inform about something not
   * expected or weird in the application.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  warn(message: string | Record<string, any>): void {
    this.logger.warning(
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a error log it is to inform about any errors in
   * the application.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  error(message: string | Record<string, any> | Error | unknown): void {
    this.logger.error(
      !(message instanceof Error) ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a critic log it is to inform a critic aspect in the
   * application flow.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  crit(message: string | Record<string, any>): void {
    this.logger.crit(
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a alert log it is to alert for a critic aspect in the
   * application behavior.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  alert(message: string | Record<string, any>): void {
    this.logger.alert(
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This is a emerg log it is to notify an emergency in the
   * application behavior or flow.
   * For more information please read the winston documentation
   * here: https://github.com/winstonjs/winston#logging-levels
   * @param  {string} message
   * @returns void
   */
  emerg(message: string | Record<string, any>): void {
    this.logger.emerg(
      typeof message !== 'string' ? JSON.stringify(message) : message,
    );
  }

  /**
   * This method found the file and method that calls
   * some of the methods in this LoggerService class
   * eg: info, notice, warn, etc
   *
   * @param  {string} prefix=''
   * @returns string
   */
  private getLineInfo(prefix = ''): string {
    let func;
    let junk;
    const { stack } = new Error();

    if (!stack) {
      return '';
    }

    // console.log stack.split('\n')[13] because we found who calls some of the methods in this class
    let [file, line] = stack.split('\n')[this.stackLevel].split(':');
    [func, file] = file.split(' (');

    if (!file) {
      [func, file] = ['??', func]; // sometimes the function isn't specified
    }

    [func, file] = [func.split(' ').pop(), path.basename(file)];

    if (!func) {
      return '';
    }

    [junk, func] = func.split('.');

    if (!func) {
      func = junk;
    }

    func = func === '??' || func === '<anonymous>' ? ' (' : ` (<${func}> `;
    file = file === 'Error' ? 'unknown' : file;
    line = line || 'unknown';

    if (!prefix && file === 'unknown' && line === 'unknown') {
      return '🔎';
    }

    return `${prefix}${func}${file}:${line})`.trim();
  }
}
