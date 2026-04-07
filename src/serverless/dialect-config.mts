export interface TursoServerlessDialectConfig {
	connection:
		| TursoServerlessConnection
		| (() => TursoServerlessConnection | Promise<TursoServerlessConnection>)
}

// See https://github.com/tursodatabase/turso/blob/main/serverless/javascript/src/connection.ts#L131
export interface TursoServerlessConnection {
	close: () => Promise<void>
	execute: (
		sql: string,
		args?: unknown[],
	) => Promise<{
		columns: string[]
		columnTypes: string[]
		lastInsertRowid: number | undefined
		rows: unknown[][]
		rowsAffected: number
	}>
}
