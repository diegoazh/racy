export class AppProviderException extends Error {
  constructor(
    module: Function,
    message = `Entity ${module?.name} is not a provider, you can only export providers from a module`,
    stack = '',
  ) {
    super(message);
    super.name = 'ModuleException';
    super.stack = stack;
  }
}
