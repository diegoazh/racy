export const AppMetadataKeys = {
  SLS_HANDLERS: Symbol('sls:handlers'),
  APP_CONTROLLERS: Symbol('app:controllers'),
  APP_MODEL: Symbol('app:model'),
  APP_PROVIDER: Symbol('app:provider'),
  BINDING_TYPE: Symbol('binding:type'),
  CONTROLLER_METADATA: Symbol('controller:metadata'),
  CONTROLLER_METHOD_METADATA: Symbol('controller:method:metadata'),
  CONTROLLER_PARAM: Symbol('controller:param'),
  CONTAINER_MODULE: Symbol('container:module'),
  MAIN_CONTAINER: Symbol('main:container'),
  MODULE_EXPORTS: Symbol('module:exports'),
  MODULE_IMPORTS: Symbol('module:imports'),
  IS_MODULE: Symbol('is:module'),
  HTTP_STATUS: Symbol('http:status'),
  IS_PUBLIC: Symbol('is:public'),
} as const;
