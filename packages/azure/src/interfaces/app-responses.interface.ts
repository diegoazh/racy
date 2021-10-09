export interface IAppResponse<T> {
  status: number;
  body: T;
}

export interface IFindAndCountResult<T> {
  count: number;
  rows: T;
}

export interface ICountResult {
  count: number;
}
