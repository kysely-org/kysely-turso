import { createClient } from '@libsql/client'
import { createClient as createCompatClient } from '@tursodatabase/serverless/compat'
import { type Dialect, type Generated, Kysely } from 'kysely'
import { LibSQLDialect } from '..'

const URL = 'http://127.0.0.1:8080'

export const SUPPORTED_DIALECTS = ['compat', 'libsql'] as const

const DIALECTS = {
	compat: new LibSQLDialect({
		client: () => createCompatClient({ url: URL }),
	}),
	libsql: new LibSQLDialect({
		client: () => createClient({ url: URL }),
	}),
} as const satisfies Record<(typeof SUPPORTED_DIALECTS)[number], Dialect>

export interface TestContext {
	db: Kysely<Database>
}

export interface Database {
	person: {
		id: Generated<string>
		name: string
	}
}

export async function initTest(
	dialect: (typeof SUPPORTED_DIALECTS)[number],
): Promise<TestContext> {
	return { db: new Kysely({ dialect: DIALECTS[dialect] }) }
}

export async function resetState(): Promise<void> {
	const client = createClient({ url: URL })

	await client.batch(
		[
			`drop table if exists person;`,
			`create table person (id varchar primary key, name varchar(255) unique not null);`,
			`insert into person (id, name) values ('48856ed4-9f1f-4111-ba7f-6092a1be96eb', 'moshe'), ('28175ebc-02ec-4c87-9a84-b3d25193fefa', 'haim'), ('cbbffbea-47d5-40ec-a98d-518b48e2bb5d', 'rivka'), ('d2b76f94-1a33-4b8c-9226-7d35390b1112', 'henry');`,
		],
		'write',
	)

	client.close()
}
