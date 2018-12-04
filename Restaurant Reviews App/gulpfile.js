var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('html', function(){
    return gulp.src('src/*.html')
        .pipe(gulp.dest('build/'))
});

gulp.task('css', function(){
    return gulp.src('src/css/*.css')
        .pipe(gulp.dest('build/css'))
});

gulp.task('js', function(){
    return gulp.src('src/js/*.js')
        .pipe(gulp.dest('build/js'))
});

gulp.task('img', function(){
    return gulp.src('src/img/**')
        .pipe(gulp.dest('build/img/'))
});

gulp.task('ico', function(){
    return gulp.src('src/ico/**')
        .pipe(gulp.dest('build/ico/'))
});

gulp.task('pwa', function(){
    return gulp.src('src/pwa/**')
        .pipe(gulp.dest('build/pwa/'))
});

gulp.task('sw', function(){
    return gulp.src('src/service-worker.js')
        .pipe(gulp.dest('build/'))
});

gulp.task('build', gulp.parallel('html', 'css', 'img', 'ico', 'js', 'pwa', 'sw'));

gulp.task('connect', function () {
    connect.server({
        root: 'build'
    })
});

gulp.task('default', gulp.series('build', 'connect'));