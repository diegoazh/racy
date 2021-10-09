import databaseConfig from '@config/database';
import {
  BlendingAnalysis,
  Component,
  ComponentRawMaterial,
  Composition,
  Country,
  DepartmentEvaluation,
  DepartmentEvaluationFile,
  File,
  HistoricalMeans,
  Port,
  Product,
  RawMaterial,
  Requirement,
  RequirementFile,
  RequirementSite,
  Site,
  SiteComponent,
  SiteRawMaterial,
  System,
  SystemComponent,
  SystemRawMaterial,
  Tracking,
} from '@models';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export default function initSequelize(): (new (...args: any[]) => any)[] {
  const config: SequelizeOptions & {
    use_env_variable?: string;
  } = (databaseConfig as any)[process.env.NODE_ENV || 'development'];

  const sequelize = config.use_env_variable
    ? new Sequelize(
        (process.env as Record<string, string>)[config.use_env_variable],
        {
          modelMatch(filename, member): boolean {
            return (
              filename.substring(0, filename.indexOf('.model')) ===
              member.toLowerCase()
            );
          },
          ...config,
        },
      )
    : new Sequelize(
        config.database as string,
        config.username as string,
        config.password as string,
        {
          modelMatch(filename, member): boolean {
            return (
              filename.substring(0, filename.indexOf('.model')) ===
              member.toLowerCase()
            );
          },
          ...config,
        },
      );

  const AppModelCollection = [
    BlendingAnalysis,
    Component,
    Country,
    DepartmentEvaluation,
    File,
    RequirementSite,
    Requirement,
    Port,
    Composition,
    Product,
    SiteComponent,
    Site,
    SystemComponent,
    System,
    HistoricalMeans,
    RequirementFile,
    DepartmentEvaluationFile,
    Tracking,
    RawMaterial,
    SiteRawMaterial,
    SystemRawMaterial,
    ComponentRawMaterial,
  ];

  sequelize.addModels(AppModelCollection);

  return AppModelCollection;
}
