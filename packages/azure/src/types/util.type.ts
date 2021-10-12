import { HttpRequest } from '@azure/functions';

export type ValuesOf<T> = T[keyof T];

export type AuthenticatedRequest<T = any> = HttpRequest & {
  loggedUser?: T;
};
