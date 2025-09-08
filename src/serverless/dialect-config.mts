export interface TursoServerlessDialectConfig {
	connection:
		| TursoServerlessConnection
		| (() => TursoServerlessConnection | Promise<TursoServerlessConnection>)
}

export interface TursoServerlessConnection {
	close: () => Promise<void>
	// prepare: (sql: string) => TursoServerlessStatement
}

export interface TursoServerlessConnectionWithSession
	extends TursoServerlessConnection {
	session: TursoServerlessSession
}

// interface TursoServerlessStatement {
// 	// biome-ignore lint/suspicious/noExplicitAny: this is fine.
// 	all: (args?: any[]) => Promise<any[]>
// 	// biome-ignore lint/suspicious/noExplicitAny: this is fine.
// 	iterate: (args?: any[]) => AsyncGenerator<any>
// 	// biome-ignore lint/suspicious/noExplicitAny: this is fine.
// 	run: (args?: any[]) => Promise<{
// 		changes: number
// 		lastInsertRowid: bigint | undefined
// 	}>
// }

interface TursoServerlessSession {
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
