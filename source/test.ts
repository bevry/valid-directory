import { equal, contains, errorEqual } from 'assert-helpers'
import kava from 'kava'
import validate from './'

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
			validate(paths.valid, function (error, valid) {
				equal(error, null, 'error is null')
				equal(valid, true, 'valid is true')
				done()
			})
		})
		test('invalid', function (done) {
			validate(paths.invalid, function (error, valid, invalidPaths) {
				equal(error, null, 'error is null')
				equal(valid, false, 'valid is false')
				if (invalidPaths)
					equal(invalidPaths.length > 0, true, 'invalid paths has entries')
				done()
			})
		})
	})
	suite('bin', function (suite) {
		suite('cwd', function (suite, test) {
			test('valid', function (done) {
				exec(`node "${paths.bin}"`, { cwd: paths.valid }, function (
					error: any,
					stdout: any
				) {
					equal(error, null, 'error is null')
					contains(stdout.toString(), `${paths.valid} is valid`)
					done()
				})
			})
			test('invalid', function (done) {
				exec(`node "${paths.bin}"`, { cwd: paths.invalid }, function (
					error: any,
					stdout: any,
					stderr: any
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
					function (error: any, stdout: any) {
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
					function (error: any, stdout: any, stderr: any) {
						errorEqual(error, 'Command failed')
						contains(stderr.toString(), `${paths.invalid} is invalid`)
						done()
					}
				)
			})
		})
	})
})
