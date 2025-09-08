import { access, cp, readFile, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
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
				const sourceDirPath = join(__dirname, `dist/${mod}`)
				const targetDirPath = join(__dirname, mod)

				await waitForFiles(sourceDirPath, ['index.d.ts', 'index.d.cts'])

				await cp(sourceDirPath, targetDirPath, { recursive: true })

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

async function waitForFiles(
	dirPath: string,
	filenames: string[],
): Promise<void> {
	const checkFiles = async (): Promise<boolean> => {
		try {
			await Promise.all(
				filenames.map((filename) => access(join(dirPath, filename))),
			)
			return true
		} catch {
			return false
		}
	}

	while (!(await checkFiles())) {
		await setTimeout(100)
	}
}
