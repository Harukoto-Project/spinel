import mysql, {
  type Connection,
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from 'mysql2/promise';

export type Db = Pool;
export type Queryable = Connection;

const CONNECTION_LIMIT = 10;
const CONNECT_TIMEOUT_MS = 10_000;

export const createDatabase = (url: string): Db =>
  mysql.createPool({
    uri: url,
    charset: 'utf8mb4',
    connectionLimit: CONNECTION_LIMIT,
    connectTimeout: CONNECT_TIMEOUT_MS,
    waitForConnections: true,
    supportBigNumbers: false,
  });

export const queryRows = async <T>(db: Queryable, sql: string, params: unknown[] = []): Promise<T[]> => {
  const [rows] = await db.query<(T & RowDataPacket)[]>(sql, params);
  return rows;
};

export const execute = async (db: Queryable, sql: string, params: unknown[] = []): Promise<ResultSetHeader> => {
  const [result] = await db.query<ResultSetHeader>(sql, params);
  return result;
};

export const withTransaction = async <T>(db: Db, task: (connection: PoolConnection) => Promise<T>): Promise<T> => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await task(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
};
