import { Container } from 'inversify';
import { camelCase, kebabCase } from 'lodash';
import { AppMetadataKeys } from '../constants/app-metadata-keys.constant';
import { InjectableType } from '../constants/injectable-type.constant';
import { AppModuleDecoratorException } from '../exceptions/app-module-decorator.exception';
import { AppProviderException } from '../exceptions/app-provider.exception';
import inversifyServerlessHelper from '../helpers/inversify-serverless.helper';
import {
  IControllerMetadata,
  IControllerMethodMetadata,
  ISingleControllerMetadata,
} from '../interfaces/metadata.interface';
import {
  IHandlersMetadata,
  IModuleDecoratorOptions,
} from '../interfaces/module-decorator-options.interface';
// import appInsights from 'applicationinsights';

/**
 * Module decorator factory
 * It helps to add metadata for every module and
 * build the exported handlers object that serverless will
 * use to send request to the application.
 *
 * @param  {} {isMain=false
 * @param  {} imports=[]
 * @param  {} controllers=[]
 * @param  {} inversifyConfig
 * @param  {IModuleDecoratorOptions} }
 * @returns ClassDecorator
 */
export function Module({
  isMain = false,
  ...members
}: IModuleDecoratorOptions): ClassDecorator {
  return function moduleDecorator<TFunction extends Function>(
    target: TFunction,
  ): TFunction | void {
    Reflect.defineMetadata(AppMetadataKeys.IS_MODULE, true, target);

    if (isMain) {
      const { imports = [], models = [] } = members;

      createMainModuleDefinition(target, imports, models);
    } else {
      createModuleMetadata(target, members);
    }
  };
}

/**
 * This function helps to create controllers metadata on every module
 *
 * @param  {Function} target
 * @param  {Function[]} controllers
 * @returns void
 */
function createModuleMetadata(
  target: Function,
  members: {
    imports?: Function[] | undefined;
    controllers?: Function[] | undefined;
    providers?: Function[] | undefined;
    exports?: Function[] | undefined;
  },
): void {
  const {
    imports = [],
    controllers = [],
    providers = [],
    exports: exportedProviders = [],
  } = members;

  const confirmedExportedProviders: Function[] = [];

  exportedProviders.forEach((provider) => {
    if (Reflect.getMetadata(AppMetadataKeys.APP_PROVIDER, provider)) {
      confirmedExportedProviders.push(provider);
    } else {
      throw new AppProviderException(provider);
    }
  });

  Reflect.defineMetadata(
    AppMetadataKeys.MODULE_EXPORTS,
    confirmedExportedProviders,
    target,
  );

  Reflect.defineMetadata(AppMetadataKeys.MODULE_IMPORTS, imports, target);

  const containerModule = new Container();
  inversifyServerlessHelper.container = containerModule;
  addProvidersToContainerByType(providers);

  controllers.forEach((controller) => {
    inversifyServerlessHelper.addControllerToContainer(controller as any);
  });

  imports.forEach((module) => {
    if (Reflect.getMetadata(AppMetadataKeys.IS_MODULE, module)) {
      const importedProviders: Function[] =
        Reflect.getMetadata(AppMetadataKeys.MODULE_EXPORTS, module) || [];
      const importsOfTheModule: Function[] =
        Reflect.getMetadata(AppMetadataKeys.MODULE_IMPORTS, module) || [];

      const neededProviders = importsOfTheModule
        .filter((moduleImported) => !imports.includes(moduleImported))
        .map(
          (filteredModule) =>
            Reflect.getMetadata(
              AppMetadataKeys.MODULE_EXPORTS,
              filteredModule,
            ) || [],
        );

      addProvidersToContainerByType([
        ...importedProviders,
        ...neededProviders.flat(),
      ]);
    } else {
      throw new AppModuleDecoratorException(module);
    }
  });

  Reflect.defineMetadata(
    AppMetadataKeys.CONTAINER_MODULE,
    containerModule,
    target,
  );

  const controllersOnModule: Function[] =
    Reflect.getMetadata(AppMetadataKeys.APP_CONTROLLERS, target.prototype) ||
    [];

  Reflect.defineMetadata(
    AppMetadataKeys.APP_CONTROLLERS,
    [...controllersOnModule, ...controllers],
    target.prototype,
  );
}

/**
 * This function helps to create the main component definition
 * creating the handlers property that will be exposed to serverless
 * to use as handlers.
 *
 * @param  {Function} target
 * @param  {Function[]} imports
 * @returns void
 */
function createMainModuleDefinition(
  target: Function,
  imports: Function[],
  models: (new (...args: any[]) => any)[],
): void {
  const allHandlers: Record<string, Function> = {};

  const mainContainer = new Container();
  const moduleContainers: Container[] = [];

  // appInsights.setup().start();

  imports.forEach((module) => {
    if (Reflect.getMetadata(AppMetadataKeys.IS_MODULE, module)) {
      const containerModule =
        Reflect.getMetadata(AppMetadataKeys.CONTAINER_MODULE, module) ||
        undefined;

      if (containerModule) {
        moduleContainers.push(containerModule);
      }
    } else {
      throw new AppModuleDecoratorException(module);
    }
  });

  /**
   * We use hierarchical DI scoping every dependency on its module
   * the only way to expose a provider outside the module is adding
   * it to the exports array. The unique entities that are global
   * are the models.
   *
   * About exported handlers:
   * The final exported handlers are built inside of this function
   * the name of every handler should be a combination of the base route
   * defined with the controller decorator factory and the name of the method
   * eg: in UsersController the find method should be 'usersFind' if base route
   * is 'users' and the method to get all users is called 'find'. If you use
   * the optional property of the http-verbs decorator factory called 'handlerName'
   * the name of the exported handler should be a combination of the base route and
   * the name passed to the http-verbs decorator factory on 'handlerName' parameter.
   *
   * @see [Support for hierarchical DI systems](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md)
   */
  moduleContainers.forEach((moduleContainer) => {
    moduleContainer.parent = mainContainer;
  });

  inversifyServerlessHelper.container = mainContainer;
  inversifyServerlessHelper.addModelsToContainer(models);

  Reflect.defineMetadata(AppMetadataKeys.MAIN_CONTAINER, mainContainer, target);

  imports.forEach((module) => {
    if (Reflect.getMetadata(AppMetadataKeys.IS_MODULE, module)) {
      const containerModule = Reflect.getMetadata(
        AppMetadataKeys.CONTAINER_MODULE,
        module,
      );

      inversifyServerlessHelper.container = containerModule;

      const controllersOfTheModule: Function[] =
        Reflect.getMetadata(
          AppMetadataKeys.APP_CONTROLLERS,
          module.prototype,
        ) || [];

      if (controllersOfTheModule.length) {
        controllersOfTheModule.forEach((controller) => {
          const handlersOnControllers: IHandlersMetadata[] =
            Reflect.getMetadata(
              AppMetadataKeys.SLS_HANDLERS,
              controller.prototype,
            );

          const controllerMetadata: IControllerMetadata = Reflect.getMetadata(
            AppMetadataKeys.CONTROLLER_METADATA,
            controller.prototype,
          );

          const baseRoute = controllerMetadata[controller.name].baseRoute
            .trim()
            .toLowerCase();

          if (handlersOnControllers?.length) {
            handlersOnControllers.forEach(
              ({ handlerName, owner, methodName }) => {
                let finalHandlerName = handlerName;

                if (typeof handlerName === 'string') {
                  finalHandlerName = camelCase(
                    `${kebabCase(baseRoute.trim())}-${kebabCase(
                      handlerName.trim(),
                    )}`,
                  );
                }

                // const allMiddleware = getAllMiddleware(owner, methodName);

                const handler = inversifyServerlessHelper.mapMethodToHandler(
                  owner as new (...args: any[]) => any,
                  methodName,
                );

                // TODO: generate the base middleware
                // const handlerWitMiddleware = BaseMiddleware(handler);

                // for (let index = 0; index < allMiddleware.length; index += 1) {
                //   handlerWitMiddleware.use(allMiddleware[index]());
                // }

                allHandlers[finalHandlerName as string] = handler; // handlerWitMiddleware;
              },
            );
          }
        });
      }
    } else {
      throw new AppModuleDecoratorException(module);
    }
  });

  Object.defineProperty(target, 'handlers', {
    value: { ...allHandlers },
  });
}

/**
 * This function helps you to find all middleware applied to
 * controllers and methods inside of the controllers applying
 * to a handler in the same order that they we defined starting
 * for middleware controllers and finishing with middleware of
 * controller methods
 *
 * @param  {new(...args:any[]} owner
 * @param  {string|symbol} methodName
 * @returns Function[]
 */
// @ts-ignore
function getAllMiddleware( // eslint-disable-line @typescript-eslint/no-unused-vars -- temporary
  owner: Function,
  methodName: string | symbol,
): Function[] {
  let allMiddleware: Function[] = [];

  const controllerMetadata: IControllerMetadata =
    Reflect.getMetadata(AppMetadataKeys.CONTROLLER_METADATA, owner.prototype) ||
    {};

  controllerMetadata[owner.name] = (controllerMetadata[owner.name] ||
    {}) as ISingleControllerMetadata;

  const { middleware: middlewareOnController } = controllerMetadata[owner.name];

  if (middlewareOnController) {
    if (Array.isArray(middlewareOnController)) {
      allMiddleware = [...allMiddleware, ...middlewareOnController];
    } else {
      allMiddleware.push(middlewareOnController);
    }
  }

  const controllerMethodMetadata: IControllerMethodMetadata =
    Reflect.getMetadata(
      AppMetadataKeys.CONTROLLER_METHOD_METADATA,
      owner.prototype,
      methodName,
    ) || {};

  const { middleware: middlewareOnMethod } = controllerMethodMetadata;

  if (middlewareOnMethod) {
    if (Array.isArray(middlewareOnMethod)) {
      allMiddleware = [...allMiddleware, ...middlewareOnMethod];
    } else {
      allMiddleware.push(middlewareOnMethod);
    }
  }

  return allMiddleware;
}

/**
 * This function helps you to add providers by type
 * to the inversify container on every module
 *
 * @param  {Function[]} providers
 * @returns void
 */
function addProvidersToContainerByType(providers: Function[]): void {
  providers.forEach((provider) => {
    if (
      Reflect.getMetadata(AppMetadataKeys.BINDING_TYPE, provider) ===
      InjectableType.CONSTRUCTOR
    ) {
      inversifyServerlessHelper.addConstructorToContainer(provider as any);
    }

    if (
      Reflect.getMetadata(AppMetadataKeys.BINDING_TYPE, provider) ===
      InjectableType.SERVICE
    ) {
      inversifyServerlessHelper.addProviderToContainer(provider as any);
    }
  });
}
