export interface IMergeResultData {
  pages: number;
  rows: number;
  columns: number;
  cells: any[];
  table: {
    test: any[];
    unit: any[];
    method: any[];
    result: any[];
  };
}
