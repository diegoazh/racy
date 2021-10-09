// eslint-disable-next-line @typescript-eslint/naming-convention -- needed to avoid collisions
declare class _MainModuleDefinition {
  public static handlers: Record<string, Function>;
}

export type MainModuleType = typeof _MainModuleDefinition;
