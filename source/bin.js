#!/usr/bin/env node
'use strict'

const validate = require('./')
const path = process.argv[2] || process.cwd()

validate(path, function (err, valid, invalidPaths) {
	if (err) {
		console.error(`${path} failed to validate`)
		console.error(err)
		if (!process.exitCode) {
			process.exitCode = 1
		}
	}
	else if (valid) {
		console.log(`${path} is valid`)
	}
	else {
		console.error(`${path} is invalid, due to the following paths:\n${invalidPaths.join('\n')}`)
		if (!process.exitCode) {
			process.exitCode = 2
		}
	}
})
