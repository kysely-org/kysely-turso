import {
	type CompiledQuery,
	type DatabaseConnection,
	type Driver,
	type QueryResult,
	RawNode,
	ReturningNode,
	SelectQueryNode,
	type TransactionSettings,
} from 'kysely'
import type {
	TursoServerlessConnection,
	TursoServerlessDialectConfig,
} from './dialect-config.mjs'

export class TursoServerlessDriver implements Driver {
	readonly #config: TursoServerlessDialectConfig
	#connection: TursoServerlessConnection | undefined

	constructor(config: TursoServerlessDialectConfig) {
		this.#config = config
	}

	async acquireConnection(): Promise<DatabaseConnection> {
		// biome-ignore lint/style/noNonNullAssertion: `init` already ran.
		return new TursoServerlessDatabaseConnection(this.#connection!)
	}

	async beginTransaction(
		_connection: DatabaseConnection,
		_settings: TransactionSettings,
	): Promise<void> {
		throw new Error(
			'TursoServerlessDriver does not support interactive transactions.',
		)
	}

	async commitTransaction(_connection: DatabaseConnection): Promise<void> {
		// noop
	}

	async destroy(): Promise<void> {
		await this.#connection?.close()
	}

	async init(): Promise<void> {
		const { connection } = this.#config

		this.#connection = isConnection(connection)
			? connection
			: await connection()
	}

	async releaseConnection(_connection: DatabaseConnection): Promise<void> {
		// noop
	}

	async rollbackTransaction(_connection: DatabaseConnection): Promise<void> {
		// noop
	}
}

function isConnection(thing: unknown): thing is TursoServerlessConnection {
	return typeof thing === 'object'
}

class TursoServerlessDatabaseConnection implements DatabaseConnection {
	readonly #connection: TursoServerlessConnection

	constructor(connection: TursoServerlessConnection) {
		this.#connection = connection
	}

	async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
		const { parameters, query, sql } = compiledQuery

		const statement = this.#connection.prepare(sql)

		if (
			SelectQueryNode.is(query) ||
			RawNode.is(query) ||
			('returning' in query &&
				query.returning &&
				ReturningNode.is(query.returning))
		) {
			const result = await statement.all([...parameters])

			return { rows: result }
		}

		const result = await statement.run([...parameters])

		const { changes, lastInsertRowid } = result

		return {
			insertId: lastInsertRowid != null ? BigInt(lastInsertRowid) : undefined,
			numAffectedRows: BigInt(changes),
			rows: [],
		}
	}

	streamQuery<R>(
		_compiledQuery: CompiledQuery,
		_chunkSize?: number,
	): AsyncIterableIterator<QueryResult<R>> {
		// in `@tursodatabase/serverless@0.1.3`, while `statement.iterate` is implemented, items are always yielded as value tuples and there's no way to get the column names tuple.
		throw new Error('TursoServerlessDialect does not support streaming.')
	}
}
