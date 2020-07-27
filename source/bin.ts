#!/usr/bin/env node

import validate from './index.js'
const path = process.argv[2] || process.cwd()

validate(path)
	.then((path) => {
		console.log(`${path} is valid`)
	})
	.catch((err) => {
		console.error(
			`${path} is invalid, due to the following paths:\n${err.message}`
		)
		if (!process.exitCode) {
			process.exitCode = 2
		}
	})
