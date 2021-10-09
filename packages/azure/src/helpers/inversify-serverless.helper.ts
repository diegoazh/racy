import { Container } from 'inversify';

/**
 * This class helps you to work with the inversify container for DI,
 * it provides many functions to add entities to the DI container in
 * the way that this application requires.
 *
 * @see https://inversify.io/
 */
export class InversifyServerlessHelper {
  private $container: Container | undefined;

  private noContainerError =
    'you must define a container before bind something to it';

  get container(): Container | undefined {
    return this.$container;
  }

  set container(container: Container | undefined) {
    this.$container = container;
  }

  public addModelToContainer<T>(type: new (...args: any[]) => T): this {
    if (!this.$container) {
      throw new Error(this.noContainerError);
    }

    this.$container.bind<typeof type>(type.name).toConstantValue(type);

    return this;
  }

  public addModelsToContainer(
    models: (new (...args: any[]) => unknown)[],
  ): this {
    models.forEach((model) => {
      this.addModelToContainer(model);
    });

    return this;
  }

  public addProviderToContainer<T>(type: new (...args: any[]) => T): this {
    if (!this.$container) {
      throw new Error(this.noContainerError);
    }

    this.$container.bind<typeof type>(type).toSelf().inSingletonScope();

    return this;
  }

  public addProvidersToContainer(
    services: (new (...args: any[]) => unknown)[],
  ): this {
    services.forEach((service) => {
      this.addProviderToContainer(service);
    });

    return this;
  }

  public addConstructorToContainer<T>(type: new (...args: any[]) => T): this {
    if (!this.$container) {
      throw new Error(this.noContainerError);
    }

    this.$container.bind<typeof type>(type).toConstructor(type);

    return this;
  }

  public addConstructorsToContainer(
    constructors: (new (...args: any[]) => unknown)[],
  ): this {
    constructors.forEach((constructor) => {
      this.addConstructorToContainer(constructor);
    });

    return this;
  }

  public addControllerToContainer<T>(type: new (...args: any[]) => T): this {
    if (!this.$container) {
      throw new Error(this.noContainerError);
    }

    this.$container.bind<typeof type>(type).toSelf();

    return this;
  }

  public addControllersToContainer(
    controllers: (new (...args: any[]) => unknown)[],
  ): this {
    controllers.forEach((controller) => {
      this.addControllerToContainer(controller);
    });

    return this;
  }

  public mapMethodToHandler<T, U extends keyof T>(
    controller: new (...args: any[]) => T | Function,
    method: U,
  ): T[U] {
    if (!this.$container) {
      throw new Error(this.noContainerError);
    }

    const controllerInstance =
      this.$container.get<typeof controller>(controller);

    return (controllerInstance as any)[method as string].bind(
      controllerInstance,
    );
  }
}

export default new InversifyServerlessHelper();
