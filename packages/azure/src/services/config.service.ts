import { Injectable } from '@shared/decorators';
import nodeConfig from 'config';
import dotenv, { config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';
import { LoggerService } from './logger.service';

/**
 * Returned config type,
 */
type ConfigType<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T;

/**
 * ConfigService class helps to load env vars,
 * and configs for NodeJs. It use under the hood
 * dotenv, dotenv-expand and config to load configuration
 * but always env vars has precedence over config files.
 */
@Injectable()
export class ConfigService {
  private logger = new LoggerService('ConfigService');

  constructor() {
    const envConf = dotenv.config();
    dotenvExpand(envConf);
  }

  /**
   * This method loads the configuration path for dotenv
   * in the first place it looks for an environment variable called DOTENV_CONFIG_PATH
   * if it is undefined looks for a file called .env.{environment} within the environments
   * folder at the root level, if it doesn't exists it looks for a .env file at the root
   * level and if it doesn't exists prints a console alert message and trust that the variables
   * were loaded in the environment previously.
   *
   * @returns string
   */
  private resolveConfigPath(): string {
    if (process.env.DOTENV_CONFIG_PATH) {
      return path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH);
    }

    if (
      fs.existsSync(
        path.resolve(
          process.cwd(),
          `./environments/.env.${process.env.NODE_ENV || 'development'}`,
        ),
      )
    ) {
      return path.resolve(
        process.cwd(),
        `./environments/.env.${process.env.NODE_ENV || 'development'}`,
      );
    }

    if (fs.existsSync(path.resolve(process.cwd(), './.env'))) {
      return path.resolve(process.cwd(), './.env');
    }

    this.logger.alert('Any configuration file was found');

    return '';
  }

  /**
   * Loads the configuration from .env files by default it takes the
   * configuration from an environment variable DOTENV_CONFIG_PATH if
   * it isn't set found .env.{process.env.NODE_ENV} inside environments
   * folder at the root level if any .env.{process.env.NODE_ENV} was found
   * it looks for a .env file at the root level and if it isn't present it
   * logs an error on the console.
   * You must call this function as soon as possible in your application.
   * @param  {string} path='./.env'
   * @returns void
   * @example configService.loadConfig();
   */
  loadConfig(): void {
    const { error, parsed } = dotenvExpand(
      config({ path: this.resolveConfigPath() }),
    );

    if (error) {
      this.logger.error(error);
    }

    if (parsed) {
      this.logger.info('configuration was loaded successfully');
    }
  }

  /**
   * @param  {string} key
   * @param  {string|number|boolean} defaultValue?
   * @returns ConfigType
   * @example configService.get<number>('MONGODB_PORT');
   */
  get<T>(key: string, defaultValue?: ConfigType<T>): ConfigType<T> {
    if (this.has(key)) {
      const result = nodeConfig.get(key);
      return result as ConfigType<T>;
    }

    return defaultValue as ConfigType<T>;
  }

  /**
   * @param  {string} key
   * @returns boolean
   * @example configService.has('MONGODB_PORT');
   */
  has(key: string): boolean {
    return nodeConfig.has(key);
  }
}
