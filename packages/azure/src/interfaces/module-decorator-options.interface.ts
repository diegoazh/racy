export interface IModuleDecoratorOptions {
  isMain?: boolean;
  imports?: Function[];
  controllers?: Function[];
  providers?: Function[];
  exports?: Function[];
  models?: (new (...args: any[]) => any)[];
}

export interface IHandlersMetadata {
  handlerName?: symbol | string;
  methodName: symbol | string;
  owner: Function;
}

export interface IInversifyConfig {
  init: Function;
}
