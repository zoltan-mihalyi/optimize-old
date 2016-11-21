var gulp = require("gulp");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var mocha = require('gulp-mocha');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var istanbul = require('gulp-istanbul');
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('default', ['tslint', 'test']);

gulp.task('clean', function() {
    return gulp.src(['dist', 'coverage'], {read: false})
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
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('test', ['compile'], function() {
    return gulp.src('test/*.js', {read: false})
        .pipe(mocha());
});

gulp.task('test:instrument', ['compile'], function() {
    return gulp.src('dist/**/*.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test:cover', ['test:instrument'], function() {
    return gulp.src('test/*.js', {read: false})
        .pipe(mocha())
        .pipe(istanbul.writeReports({
            reporters: ['json']
        }))
        .on('end', function() {
            return gulp.src('coverage/coverage-final.json')
                .pipe(remapIstanbul({
                    reports: {
                        'html': 'coverage/html',
                        'text-summary': null,
                        'json': 'coverage/coverage.json'
                    }
                }));
        });
});