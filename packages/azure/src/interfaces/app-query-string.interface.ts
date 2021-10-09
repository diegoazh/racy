import { Order } from 'sequelize/types';

export interface IAppQueryString {
  pageSize?: number;
  pageIndex?: number;
  filter?: Record<string, any>;
  order?: Order;
}
