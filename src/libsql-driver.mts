import type {
	CompiledQuery,
	DatabaseConnection,
	Driver,
	QueryCompiler,
	QueryResult,
	TransactionSettings,
} from 'kysely'
import type {
	LibSQLClient,
	LibSQLDialectConfig,
} from './libsql-dialect-config.mjs'

export class LibSQLDriver implements Driver {
	readonly #config: LibSQLDialectConfig
	#client: LibSQLClient | undefined

	constructor(config: LibSQLDialectConfig) {
		this.#config = config
	}

	async acquireConnection(): Promise<DatabaseConnection> {
		// biome-ignore lint/style/noNonNullAssertion: `init` has already run at this point.
		return new LibSQLDatabaseConnection(this.#client!)
	}

	async beginTransaction(
		connection: DatabaseConnection,
		settings: TransactionSettings,
	): Promise<void> {
		throw new Error('unimplemented!')
	}

	async commitTransaction(connection: DatabaseConnection): Promise<void> {
		throw new Error('unimplemented!')
	}

	async destroy(): Promise<void> {
		this.#client?.close()
	}

	async init(): Promise<void> {
		const { client } = this.#config

		this.#client = isClient(client) ? client : await client()
	}

	async releaseConnection(): Promise<void> {
		// noop
	}

	async releaseSavepoint(
		connection: DatabaseConnection,
		savepointName: string,
		compileQuery: QueryCompiler['compileQuery'],
	): Promise<void> {
		throw new Error('unimplemented')
	}

	async rollbackToSavepoint(
		connection: DatabaseConnection,
		savepointName: string,
		compileQuery: QueryCompiler['compileQuery'],
	): Promise<void> {
		throw new Error('unimplemented')
	}

	async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
		throw new Error('unimplemented')
	}

	async savepoint(
		connection: DatabaseConnection,
		savepointName: string,
		compileQuery: QueryCompiler['compileQuery'],
	): Promise<void> {
		throw new Error('unimplemented')
	}
}

function isClient(thing: unknown): thing is LibSQLClient {
	return typeof thing === 'object'
}

class LibSQLDatabaseConnection implements DatabaseConnection {
	readonly #client: LibSQLClient

	constructor(client: LibSQLClient) {
		this.#client = client
	}

	async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
		const result = await this.#client.execute(compiledQuery.sql, [
			...compiledQuery.parameters,
		])

		const rows: R[] = []

		for (const row of result.rows) {
			const obj: Record<string, unknown> = {}

			for (const key in row) {
				obj[key] = row[key]
			}

			rows.push(obj as R)
		}

		return {
			insertId: result.lastInsertRowid,
			numAffectedRows: BigInt(result.rowsAffected),
			rows,
		}
	}

	streamQuery<R>(
		compiledQuery: CompiledQuery,
		chunkSize?: number,
	): AsyncIterableIterator<QueryResult<R>> {
		throw new Error('unimplemented!')
	}
}
