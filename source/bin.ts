#!/usr/bin/env node

import validate from './index.js'
const path = process.argv[2] || process.cwd()

validate(path)
	.then(([valid, invalidPaths]) => {
		if (valid) {
			console.log(`${path} is valid`)
		} else {
			console.error(
				`${path} is invalid, due to the following paths:\n`,
				invalidPaths,
			)
			process.exitCode = 1
		}
	})
	.catch((err) => {
		console.error(`can't validate ${path}, due to:\n${err.message}`)
		if (!process.exitCode) {
			process.exitCode = 2
		}
	})
