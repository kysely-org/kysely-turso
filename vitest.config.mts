import { isCI } from 'std-env'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		allowOnly: !isCI,
		fileParallelism: false,
		globalSetup: ['./vitest.setup.mts'],
		maxConcurrency: 1,
		typecheck: {
			enabled: true,
			ignoreSourceErrors: true,
		},
	},
})
