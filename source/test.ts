import { join, resolve } from 'node:path'
import { rm, mkdir, writeFile } from 'node:fs/promises'
import { exec } from 'node:child_process'
import { platform, env } from 'node:process'
import { tmpdir } from 'node:os'

import { equal, deepEqual, contains } from 'assert-helpers'
import kava from 'kava'
import validate from './index.js'

import filedirname from 'filedirname'
const [file, dir] = filedirname()
const fixtures = resolve(
	tmpdir(),
	'valid-directory',
	`fixtures - ${Math.random()}`
)
const paths = {
	root: resolve(dir, '..'),
	bin: resolve(dir, 'bin.js'),
	valid: resolve(fixtures, 'valid'),
	invalid: resolve(fixtures, 'invalid'),
}
const invalidPaths = platform.startsWith('win')
	? []
	: ['<foo|bar>', 'foo:bar', 'con', 'prn', 'aux', 'nul', 'com1', 'lpt1'].sort()
const validPaths = ['foo-bar']
const invalidPathsNested = invalidPaths.map((f) => join('invalid', f))
const validPathsNested = validPaths.map((f) => join('valid', f))
const allPathsNested = [
	'valid',
	'invalid',
	...invalidPathsNested,
	...validPathsNested,
].sort()

kava.suite('valid-directory', function (suite, test) {
	test('mkdirs', function (done) {
		Promise.all([
			mkdir(paths.valid, { recursive: true }),
			mkdir(paths.invalid, { recursive: true }),
		])
			.then(() => done())
			.catch(done)
	})
	test('mkfiles', function (done) {
		Promise.all(
			invalidPaths
				.map((filename) => writeFile(resolve(paths.invalid, filename), ''))
				.concat(
					validPaths.map((filename) =>
						writeFile(resolve(paths.valid, filename), '')
					)
				)
		)
			.then(() => done())
			.catch(done)
	})
	suite('api', function (suite, test) {
		test('valid', function (done) {
			validate(paths.valid)
				.then(([isValid, _invalidPaths, _allPaths]) => {
					deepEqual(_invalidPaths, [], 'no invalid paths')
					deepEqual(_allPaths.sort(), validPaths, 'all paths are correct')
					equal(isValid, true, 'only valid paths')
					done()
				})
				.catch(done)
		})
		test('invalid', function (done) {
			validate(paths.invalid)
				.then(([isValid, _invalidPaths, _allPaths]) => {
					deepEqual(
						_invalidPaths.sort(),
						invalidPaths,
						'invalid paths are correct'
					)
					deepEqual(_allPaths.sort(), invalidPaths, 'all paths are correct')
					equal(isValid, !invalidPaths.length, 'only valid paths') // windows adjustment
					done()
				})
				.catch(done)
		})
		test('all', function (done) {
			validate(fixtures)
				.then(([isValid, _invalidPaths, _allPaths]) => {
					deepEqual(
						_invalidPaths.sort(),
						invalidPathsNested,
						'invalid paths are correct'
					)
					deepEqual(_allPaths.sort(), allPathsNested, 'all paths are correct')
					equal(isValid, !invalidPaths.length, 'only valid paths') // windows adjustment
					done()
				})
				.catch(done)
		})
	})
	suite('bin', function (suite) {
		suite('cwd', function (suite, test) {
			test('valid', function (done) {
				exec(
					`node "${paths.bin}"`,
					{ cwd: paths.valid, encoding: 'utf8' },
					function (error, stdout) {
						equal(error, null, 'error is null')
						contains(stdout.toString(), `${paths.valid} is valid`)
						done()
					}
				)
			})
			// windows adjustment
			if (invalidPaths.length) {
				test('invalid', function (done) {
					exec(
						`node "${paths.bin}"`,
						{ cwd: paths.invalid, encoding: 'utf8' },
						function (error, stdout, stderr) {
							contains(stderr.toString(), `${paths.invalid} is invalid`)
							done()
						}
					)
				})
			}
		})
		suite('arg', function (suite, test) {
			test('valid', function (done) {
				exec(
					`node "${paths.bin}" "${paths.valid}"`,
					{ cwd: paths.root, encoding: 'utf8' },
					function (error, stdout) {
						equal(error, null, 'error is null')
						contains(stdout.toString(), `${paths.valid} is valid`)
						done()
					}
				)
			})
			// windows adjustment
			if (invalidPaths.length) {
				test('invalid', function (done) {
					exec(
						`node "${paths.bin}" "${paths.invalid}"`,
						{ cwd: paths.root, encoding: 'utf8' },
						function (error, stdout, stderr) {
							contains(stderr.toString(), `${paths.invalid} is invalid`)
							done()
						}
					)
				})
			}
		})
	})
	test('cleanup', function (done) {
		rm(fixtures, { recursive: true })
			.then(() => done())
			.catch(done)
	})
})
