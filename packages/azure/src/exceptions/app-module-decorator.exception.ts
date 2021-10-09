export class AppModuleDecoratorException extends Error {
  constructor(
    module: Function,
    message = `Entity ${module?.name} is not a module, you can only add modules to the imports array`,
    stack = '',
  ) {
    super(message);
    super.name = 'ModuleException';
    super.stack = stack;
  }
}
