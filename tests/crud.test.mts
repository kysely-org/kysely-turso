import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
	initTest,
	resetState,
	SUPPORTED_DIALECTS,
	type TestContext,
} from './test-setup.mjs'

for (const dialect of SUPPORTED_DIALECTS) {
	describe(dialect, () => {
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

		it('should execute select queries', async () => {
			const result = await ctx.db.selectFrom('person').selectAll().execute()

			expect(result).toMatchInlineSnapshot()
		})

		it('should execute insert queries - no returning', async () => {
			const result = await ctx.db
				.insertInto('person')
				.values({ name: 'johnny' })
				.executeTakeFirstOrThrow()

			expect(result).toMatchInlineSnapshot(`
				InsertResult {
				  "insertId": 5n,
				  "numInsertedOrUpdatedRows": 1n,
				}
			`)
		})

		it('should execute insert queries - with returning', async () => {
			const result = await ctx.db
				.insertInto('person')
				.values({
					id: 'c260ee08-5c8a-4ed8-8415-575af63f22da',
					name: 'duncan',
				})
				.returning('id')
				.executeTakeFirstOrThrow()

			expect(result).toMatchInlineSnapshot(`
				{
				  "id": "c260ee08-5c8a-4ed8-8415-575af63f22da",
				}
			`)
		})

		it('should execute update queries - no returning', async () => {
			const result = await ctx.db
				.updateTable('person')
				.set('name', 'alex')
				.where('name', '=', 'moshe')
				.executeTakeFirstOrThrow()

			expect(result).toMatchInlineSnapshot(`
				UpdateResult {
				  "numChangedRows": undefined,
				  "numUpdatedRows": 1n,
				}
			`)
		})

		it('should execute update queries - with returning', async () => {
			const result = await ctx.db
				.updateTable('person')
				.set('name', 'alex')
				.where('name', '=', 'moshe')
				.returning('id')
				.executeTakeFirstOrThrow()

			expect(result).toMatchInlineSnapshot(`
				{
				  "id": "48856ed4-9f1f-4111-ba7f-6092a1be96eb",
				}
			`)
		})

		it('should execute delete queries - no returning', async () => {
			const result = await ctx.db
				.deleteFrom('person')
				.where('id', '=', '48856ed4-9f1f-4111-ba7f-6092a1be96eb')
				.executeTakeFirstOrThrow()

			expect(result).toMatchInlineSnapshot(`
				DeleteResult {
				  "numDeletedRows": 1n,
				}
			`)
		})

		it('should execute delete queries - with returning', async () => {
			const result = await ctx.db
				.deleteFrom('person')
				.where('id', '=', '48856ed4-9f1f-4111-ba7f-6092a1be96eb')
				.returning('name')
				.executeTakeFirstOrThrow()

			expect(result).toMatchInlineSnapshot(`
				{
				  "name": "moshe",
				}
			`)
		})

		it.skip('should stream select queries: exhaust', async () => {
			const items = []

			const iterator = ctx.db.selectFrom('person').selectAll().stream()

			for await (const item of iterator) {
				items.push(item)
			}

			expect(items).toMatchInlineSnapshot()
		})

		it.skip('should stream select queries: break', async () => {
			const items = []

			const iterator = ctx.db.selectFrom('person').selectAll().stream()

			for await (const item of iterator) {
				items.push(item)

				break
			}

			expect(items).toMatchInlineSnapshot()
		})
	})
}
