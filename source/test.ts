import { resolve, dirname } from 'path'
import { exec } from 'child_process'

import { equal, contains } from 'assert-helpers'
import kava from 'kava'
import validate from './index.js'

import filedirname from 'filedirname'
const [file, dir] = filedirname()

const paths = {
	root: resolve(dir, '..'),
	bin: resolve(dir, 'bin.js'),
	valid: resolve(dir, '..', 'test-fixtures', 'valid'),
	invalid: resolve(dir, '..', 'test-fixtures', 'invalid'),
}

kava.suite('valid-directory', function (suite) {
	suite('api', function (suite, test) {
		test('valid', function (done) {
			validate(paths.valid)
				.then(([isValid]) => {
					equal(isValid, true, 'path is valid')
					done()
				})
				.catch(done)
		})
		test('invalid', function (done) {
			validate(paths.invalid)
				.then(([isValid, invalidPaths]) => {
					equal(isValid, false, 'path is invalid')
					equal(invalidPaths?.length, 6)
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
		})
	})
})
