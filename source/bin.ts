#!/usr/bin/env node

import validate, { IsValidDirectory } from './index.js'
const path = process.argv[2] || process.cwd()

validate(path)
	.then((valid: IsValidDirectory) => {
		if (valid[0]) {
			console.log(`${path} is valid`)
		} else {
			console.error(
				`${path} is invalid, due to the following paths:\n${valid[1]}`
			)
		}
	})
	.catch((err) => {
		console.error(`can't validate ${path}, due to:\n${err.message}`)
		if (!process.exitCode) {
			process.exitCode = 2
		}
	})
