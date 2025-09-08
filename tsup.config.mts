import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'pathe'
import { defineConfig } from 'tsup'

export default defineConfig({
	clean: ['dist', 'libsql', 'serverless'].map((mod) => join(__dirname, mod)),
	dts: true,
	entry: ['src/index.mts', 'src/libsql/index.mts', 'src/serverless/index.mts'],
	format: ['cjs', 'esm'],
	async onSuccess() {
		await Promise.all(
			['libsql', 'serverless'].map(async (mod) => {
				const targetDirPath = join(__dirname, mod)

				await cp(join(__dirname, `dist/${mod}`), targetDirPath, {
					recursive: true,
				})

				const esmFilePath = join(targetDirPath, 'index.js')

				const content = await readFile(esmFilePath, 'utf-8')

				// naively fix only `../{filename}` imports to `../dist/{filename}`.
				const fixedContent = content.replace(
					/from ["']\.\.\/([^"']+\.js)["']/g,
					'from "../dist/$1"',
				)

				await writeFile(esmFilePath, fixedContent)
			}),
		)
	},
})
