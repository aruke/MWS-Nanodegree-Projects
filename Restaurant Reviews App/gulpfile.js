var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('connect', function () {
    connect.server({
        root: 'src',
        livereload: true
    })
});

gulp.task('default', gulp.parallel('connect'), function() {
    console.log("Default task finished.")
});