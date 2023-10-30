import readdir from 'readdir-cluster'
import isValidFilename from '@bevry/valid-filename'

/** Array of paths that are invalid */
export type InvalidPaths = string[]

/** Whether or not the directory was valid */
export type ValidateResult =
	| [valid: false, invalidPaths: InvalidPaths]
	| [valid: true]

/** Iterator for readdir-cluster that validates the paths using valid-filename */
export function validator(
	this: InvalidPaths,
	fullPath: string,
	relativePath: string,
) {
	const valid = isValidFilename(relativePath)

	if (!valid) {
		this.push(fullPath)
	}
}

/** Validate a directory and its descendants */
export default function validate(fullPath: string): Promise<ValidateResult> {
	return new Promise(function (resolve, reject) {
		const invalidPaths: InvalidPaths = []
		readdir(fullPath, validator.bind(invalidPaths), function (err: Error) {
			if (err) {
				return reject(err)
			} else if (invalidPaths.length) {
				return resolve([false, invalidPaths])
			} else {
				return resolve([true])
			}
		})
	})
}
