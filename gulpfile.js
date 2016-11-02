var gulp = require("gulp");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var mocha = require('gulp-mocha');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('default', ['tslint', 'test']);

gulp.task('clean', function() {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('compile', ['clean'], function() {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(tsProject.options.outDir));
});

gulp.task('tslint', function() {
    return gulp.src('src/**/*.ts')
        .pipe(tslint())
        .pipe(tslint.report());
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['default']);
});

gulp.task('test', ['compile'], function() {
    return gulp.src('test/**/*.js', {read: false})
        .pipe(mocha());
});