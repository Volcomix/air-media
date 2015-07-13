/// <reference path="typings/tsd.d.ts" />

var gulp = require('gulp');
var tsc = require('gulp-typescript');
var ambientTypescript = require('gulp-ambient-typescript');
var mocha = require('gulp-mocha');
var merge = require('merge2');
var del = require('del');

var tsProject = tsc.createProject('tsconfig.json');

gulp.task('clean', function (cb) {
	del('release', cb);
});

gulp.task('build', ['clean'], function () {
	var tscResult = gulp.src('src/**/*.ts').pipe(tsc(tsProject));

	return merge([
		tscResult.js.pipe(gulp.dest('release')),
		tscResult.dts
			.pipe(ambientTypescript('AirMedia.d.ts', 'air-media'))
			.pipe(gulp.dest('release/definitions'))
	]);
});

gulp.task('test', ['build'], function () {
	return gulp.src('release/test/**/*.js')
		.pipe(mocha({timeout: 60000}));
});