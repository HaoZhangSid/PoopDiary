import type { AsyncSqliteDatabase } from './types';

export const DATABASE_NAME = 'poop-diary.db';

export async function openDiaryDatabase(): Promise<AsyncSqliteDatabase> {
  const { openDatabaseAsync } = await import('expo-sqlite');
  const database = await openDatabaseAsync(DATABASE_NAME);
  return {
    execAsync: (sql) => database.execAsync(sql),
    runAsync: (sql, ...params) => database.runAsync(sql, ...params),
    getFirstAsync: <T>(sql: string, ...params: (string | number | null)[]) => database.getFirstAsync<T>(sql, ...params),
    getAllAsync: <T>(sql: string, ...params: (string | number | null)[]) => database.getAllAsync<T>(sql, ...params),
  };
}
