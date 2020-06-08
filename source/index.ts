'use strict'

const readdir = require('readdir-cluster')
const validFilename = require('valid-filename')

/**
 * The validate completion callback
 * @callback validateCallback
 * @param {Error} error - if validation failed to execute, this is the error
 * @param {boolean} valid - if validation failed, this is false, otherwise true
 * @param {Array<string>} invalidPaths - if validation failed, this an array of the full paths that failed
 * @returns {void}
 */

/**
 * Iterator for readdir-cluster that validates the paths using valid-filename
 * @param {string} fullPath
 * @param {string} relativePath
 * @returns {void}
 * @private
 */
function validator(fullPath, relativePath) {
	const valid = validFilename(relativePath)
	if (!valid) {
		this.push(fullPath)
	}
}

/**
 * Validate a directory and its descendants
 * @param {string} fullPath - the directory to validate
 * @param {validateCallback} next - the completion callback
 * @returns {void}
 */
function validate(fullPath, next) {
	const invalidPaths = []
	readdir(fullPath, validator.bind(invalidPaths), function (err) {
		if (err) {
			return next(err)
		} else if (invalidPaths.length) {
			return next(null, false, invalidPaths)
		} else {
			return next(null, true)
		}
	})
}

module.exports = validate
