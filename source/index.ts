import readdir from 'readdir-cluster'
import validFilename from 'valid-filename'

export type Errnull = Error | null

/**
 * The validate completion callback
 */
type validateCallback = (
	error: Errnull,
	valid?: boolean,
	invalidPaths?: string[]
) => void

/**
 * Iterator for readdir-cluster that validates the paths using valid-filename
 */
function validator(this: any, fullPath: string, relativePath: string) {
	const valid = validFilename(relativePath)
	if (!valid) {
		this.push(fullPath)
	}
}

/**
 * Validate a directory and its descendants
 */
export default function validate(fullPath: string): Promise<Errnull | String> {
	const invalidPaths: string[] = []
	return new Promise((resolve, reject) => {
		readdir(fullPath, validator.bind(invalidPaths), function (err: Error) {
			if (err) {
				reject(err)
			} else if (invalidPaths.length) {
				reject(new Error('Invalid paths:' + invalidPaths?.join('\n')))
			} else {
				return resolve(fullPath)
			}
		})
	})
}
