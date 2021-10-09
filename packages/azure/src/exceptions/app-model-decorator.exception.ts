export class AppModelDecoratorException extends Error {
  constructor(
    module: Function,
    message = `Entity ${module?.name} is not a defined model; remember that you can only decorate model properties with this decorator. If this entity is a model do not forget to decorate it with the @EntityModel() decorator`,
    stack = '',
  ) {
    super(message);
    super.name = 'ModuleException';
    super.stack = stack;
  }
}
