var gulp = require("gulp");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var mocha = require('gulp-mocha');
var tsProject = ts.createProject("tsconfig.json");

gulp.task('default', ['tslint', 'compile', 'test']);

gulp.task('compile', function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(tsProject.options.outDir));
});

gulp.task('tslint', function() {
    return gulp.src('src/**/*.ts')
        .pipe(tslint())
        .pipe(tslint.report());
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['default']);
});

gulp.task('test', function() {
    gulp.src('test/**/*.js', {read: false})
        .pipe(mocha());
});