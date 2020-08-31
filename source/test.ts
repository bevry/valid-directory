import { equal, contains } from 'assert-helpers'
import kava from 'kava'
import validate from './index.js'

const pathUtil = require('path')
const { exec } = require('child_process')
const paths = {
	root: pathUtil.resolve(__dirname, '..'),
	bin: pathUtil.resolve(__dirname, 'bin.js'),
	valid: pathUtil.resolve(__dirname, '..', 'test-fixtures', 'valid'),
	invalid: pathUtil.resolve(__dirname, '..', 'test-fixtures', 'invalid'),
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
				exec(`node "${paths.bin}"`, { cwd: paths.valid }, function (
					error: Error,
					stdout: string
				) {
					equal(error, null, 'error is null')
					contains(stdout.toString(), `${paths.valid} is valid`)
					done()
				})
			})
			test('invalid', function (done) {
				exec(`node "${paths.bin}"`, { cwd: paths.invalid }, function (
					error: Error,
					stdout: string,
					stderr: string
				) {
					contains(stderr.toString(), `${paths.invalid} is invalid`)
					done()
				})
			})
		})
		suite('arg', function (suite, test) {
			test('valid', function (done) {
				exec(
					`node "${paths.bin}" "${paths.valid}"`,
					{ cwd: paths.root },
					function (error: Error, stdout: string) {
						equal(error, null, 'error is null')
						contains(stdout.toString(), `${paths.valid} is valid`)
						done()
					}
				)
			})
			test('invalid', function (done) {
				exec(
					`node "${paths.bin}" "${paths.invalid}"`,
					{ cwd: paths.root },
					function (error: Error, stdout: string, stderr: string) {
						contains(stderr.toString(), `${paths.invalid} is invalid`)
						done()
					}
				)
			})
		})
	})
})
