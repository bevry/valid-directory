import readdir from 'readdir-cluster'
import validFilename from 'valid-filename'

/**
 * The validate completion callback
 * @callback validateCallback
 * @param {Error} error - if validation failed to execute, this is the error
 * @param {boolean} valid - if validation failed, this is false, otherwise true
 * @param {Array<string>} invalidPaths - if validation failed, this an array of the full paths that failed
 * @returns {void}
 */
type validateCallback = (
	error: Error | null,
	valid?: boolean,
	invalidPaths?: string[]
) => void

/**
 * Iterator for readdir-cluster that validates the paths using valid-filename
 * @param {string} fullPath
 * @param {string} relativePath
 * @returns {void}
 * @private
 */
function validator(this: any, fullPath: string, relativePath: string) {
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
export default function validate(fullPath: string, next: validateCallback) {
	const invalidPaths: any = []
	readdir(fullPath, validator.bind(invalidPaths), function (err: Error) {
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
