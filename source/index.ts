import { readdir } from 'node:fs/promises'
import { basename } from 'node:path'
import isValidFilename from '@bevry/valid-filename'

/** Array of paths that are invalid */
export type Paths = string[]

/** Whether or not the directory was valid */
export type ValidateResult =
	| [valid: false, invalidRelativePaths: Paths, relativePaths: Paths]
	| [valid: true, invalidRelativePaths: [], relativePaths: Paths]

/** Validate a directory and its descendants */
export default async function validate(
	fullPath: string,
): Promise<ValidateResult> {
	// https://nodejs.org/api/fs.html#fspromisesreaddirpath-options
	const relativePaths: Paths = await readdir(fullPath, { recursive: true })
	const invalidRelativePaths: Paths = relativePaths.filter(
		(relativePath) => !isValidFilename(basename(relativePath)),
	)
	if (invalidRelativePaths.length) {
		return [false, invalidRelativePaths, relativePaths]
	} else {
		return [true, [], relativePaths]
	}
}
