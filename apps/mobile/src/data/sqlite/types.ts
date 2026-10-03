export type SqlValue = string | number | null;

export interface AsyncSqliteDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: SqlValue[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T>(sql: string, ...params: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: SqlValue[]): Promise<T[]>;
}

export type DatabaseOpener = () => Promise<AsyncSqliteDatabase>;
