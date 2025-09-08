import type {
	CompiledQuery,
	DatabaseConnection,
	Driver,
	QueryResult,
	TransactionSettings,
} from 'kysely'
import { isValidIdentifier } from '../utils.mjs'
import type {
	TursoServerlessConnection,
	TursoServerlessConnectionWithSession,
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
		const { parameters, sql } = compiledQuery

		// we're hacking. session is unofficially exposed on connection.
		// we're doing so because `prepare -> all/run` return an opinionated result. ({rows: Record<string, unknown>[]} / {changes: number; lastInsertRowid: bigint | undefined})
		// such results require us to have logic that decides (gambles) which method to run.
		// in future releases, it seems `connection` will expose `execute` directly.
		// https://github.com/tursodatabase/turso/blob/b7c43cf293a4b627862a275333f6911c00289979/packages/turso-serverless/src/connection.ts#L77-L95
		const result = await (
			this.#connection as TursoServerlessConnectionWithSession
		).session.execute(sql, [...parameters])

		const { columns, lastInsertRowid, rows: valueTuples, rowsAffected } = result

		const rows: R[] = []

		for (const valueTuple of valueTuples) {
			const row: Record<string, unknown> = {}

			for (let i = 0, len = columns.length; i < len; i++) {
				const column = columns[i]

				if (isValidIdentifier(column)) {
					row[column] = valueTuple[i]
				}
			}

			rows.push(row as R)
		}

		return {
			insertId: lastInsertRowid != null ? BigInt(lastInsertRowid) : undefined,
			numAffectedRows: BigInt(rowsAffected),
			rows,
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
