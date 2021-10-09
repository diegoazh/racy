import { HttpStatus } from '../constants/http-status.constant';
import { HttpVerb } from '../constants/http-verb.constant';
import { RequestKey } from '../constants/request-key.constant';

export interface ISingleControllerMetadata {
  baseRoute: string;
  middleware?: Function | Function[];
  isPublic?: boolean;
}

export interface IControllerMetadata {
  [key: string]: ISingleControllerMetadata;
}

export interface IControllerMethodMetadata {
  httpStatus: typeof HttpStatus[keyof typeof HttpStatus];
  httpVerb: typeof HttpVerb[keyof typeof HttpVerb];
  route: string;
  middleware?: Function | Function[];
  isPublic?: boolean;
}

export interface IControllerParamMetadata {
  [methodName: string]: IParamMethodDefinition;
}

export interface IParamMethodDefinition {
  [parameterIndex: number]: IParameterData;
}

export interface IParameterData {
  keys: string | string[];
  index: number;
  reqKey: typeof RequestKey[keyof typeof RequestKey];
  type: Function;
  typeName: string;
}
