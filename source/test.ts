import { equal, contains, errorEqual } from 'assert-helpers'
import kava from 'kava'
import validate, { Errnull } from './index.js'

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
				.then((path) => {
					equal(path, paths.valid, 'path is valid')
				})
				.catch((error) => {
					equal(1, 2, 'path is invalid')
				})
			done()
		})
		test('invalid', function (done) {
			validate(paths.invalid)
				.then((path) => {
					equal(1, 2, 'path is valid')
				})
				.catch(() => {
					equal(1, 1, 'path is invalid')
				})
			done()
		})
	})
	suite('bin', function (suite) {
		suite('cwd', function (suite, test) {
			test('valid', function (done) {
				exec(`node "${paths.bin}"`, { cwd: paths.valid }, function (
					error: Errnull,
					stdout: string
				) {
					equal(error, null, 'error is null')
					contains(stdout.toString(), `${paths.valid} is valid`)
					done()
				})
			})
			test('invalid', function (done) {
				exec(`node "${paths.bin}"`, { cwd: paths.invalid }, function (
					error: Errnull,
					stdout: string,
					stderr: string
				) {
					errorEqual(error, 'Command failed')
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
					function (error: Errnull, stdout: string) {
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
					function (error: Errnull, stdout: any, stderr: any) {
						errorEqual(error, 'Command failed')
						contains(stderr.toString(), `${paths.invalid} is invalid`)
						done()
					}
				)
			})
		})
	})
})
