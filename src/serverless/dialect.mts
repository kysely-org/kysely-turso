import {
	type DatabaseIntrospector,
	type Dialect,
	type DialectAdapter,
	type Driver,
	type Kysely,
	type QueryCompiler,
	SqliteAdapter,
	SqliteIntrospector,
	SqliteQueryCompiler,
} from 'kysely'
import { freeze } from '../utils.mjs'
import type { TursoServerlessDialectConfig } from './dialect-config.mjs'
import { TursoServerlessDriver } from './driver.mjs'

export class TursoServerlessDialect implements Dialect {
	readonly #config: TursoServerlessDialectConfig

	constructor(config: TursoServerlessDialectConfig) {
		this.#config = freeze({ ...config })
	}

	createAdapter(): DialectAdapter {
		return new SqliteAdapter()
	}

	createDriver(): Driver {
		return new TursoServerlessDriver(this.#config)
	}

	// biome-ignore lint/suspicious/noExplicitAny: this is fine.
	createIntrospector(db: Kysely<any>): DatabaseIntrospector {
		return new SqliteIntrospector(db)
	}

	createQueryCompiler(): QueryCompiler {
		return new SqliteQueryCompiler()
	}
}
