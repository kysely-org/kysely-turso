import { sql } from 'kysely'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
	initTest,
	resetState,
	SUPPORTED_DIALECTS,
	type TestContext,
} from './test-setup.mjs'

for (const dialect of SUPPORTED_DIALECTS) {
	describe.skipIf(dialect === 'compat' || dialect === 'serverless')(
		dialect,
		() => {
			let ctx: TestContext

			beforeAll(async () => {
				ctx = await initTest(dialect)
			})

			beforeEach(async () => {
				await resetState()
			})

			afterAll(async () => {
				await ctx.db.destroy()
			})

			it('should commit transactions', async () => {
				await ctx.db.transaction().execute(async (trx) => {
					await sql`delete from person`.execute(trx)
					await sql`insert into person (id, name) values ('3af343af-e343-43d4-b0d3-ae1b813a000a', 'josh')`.execute(
						trx,
					)
				})

				expect(
					await sql`select * from person order by name`.execute(ctx.db),
				).toMatchInlineSnapshot(`
					{
					  "insertId": undefined,
					  "numAffectedRows": 0n,
					  "rows": [
					    {
					      "id": "3af343af-e343-43d4-b0d3-ae1b813a000a",
					      "name": "josh",
					    },
					  ],
					}
				`)
			})

			it('should rollback transactions', async () => {
				await expect(() =>
					ctx.db.transaction().execute(async (trx) => {
						await sql`delete from person`.execute(trx)
						await sql`insert into person (id, name) values ('3af343af-e343-43d4-b0d3-ae1b813a000a', 'josh')`.execute(
							trx,
						)
						throw new Error('oopsy')
					}),
				).rejects.toThrow('oopsy')

				expect(
					await sql`select * from person order by name`.execute(ctx.db),
				).toMatchInlineSnapshot(`
					{
					  "insertId": undefined,
					  "numAffectedRows": 0n,
					  "rows": [
					    {
					      "id": "28175ebc-02ec-4c87-9a84-b3d25193fefa",
					      "name": "haim",
					    },
					    {
					      "id": "d2b76f94-1a33-4b8c-9226-7d35390b1112",
					      "name": "henry",
					    },
					    {
					      "id": "48856ed4-9f1f-4111-ba7f-6092a1be96eb",
					      "name": "moshe",
					    },
					    {
					      "id": "cbbffbea-47d5-40ec-a98d-518b48e2bb5d",
					      "name": "rivka",
					    },
					  ],
					}
				`)
			})

			it('should use savepoints in transactions', async () => {
				const trx = await ctx.db.startTransaction().execute()

				await sql`delete from person`.execute(trx)

				const afterDelete = await trx.savepoint('after delete').execute()

				await sql`insert into person (id, name) values ('3af343af-e343-43d4-b0d3-ae1b813a000a', 'josh')`.execute(
					afterDelete,
				)

				await afterDelete.releaseSavepoint('after delete').execute()

				await trx.commit().execute()

				expect(
					await sql`select * from person order by name`.execute(ctx.db),
				).toMatchInlineSnapshot(`
					{
					  "insertId": undefined,
					  "numAffectedRows": 0n,
					  "rows": [
					    {
					      "id": "3af343af-e343-43d4-b0d3-ae1b813a000a",
					      "name": "josh",
					    },
					  ],
					}
				`)
			})
		},
	)
}
