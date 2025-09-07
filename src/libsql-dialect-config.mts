// import { Client, type Row } from '@libsql/client'

export interface LibSQLDialectConfig {
	client: LibSQLClient | (() => LibSQLClient | Promise<LibSQLClient>)
}

export interface LibSQLClient {
	close: () => void
	// biome-ignore lint/suspicious/noExplicitAny: this is fine.
	execute: (sql: string, args?: any[]) => Promise<LibSQLResultSet>
}

interface LibSQLResultSet {
	lastInsertRowid: bigint | undefined
	rows: Record<string, unknown>[]
	rowsAffected: number
}
