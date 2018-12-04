let gulp = require('gulp');
let connect = require('gulp-connect');
let sass = require('gulp-sass');
let concatCss = require('gulp-concat-css');

gulp.task('html', function(){
    return gulp.src('src/*.html')
        .pipe(gulp.dest('build/'))
});

gulp.task('sass', function(){
    return gulp.src(['node_modules/materialize-css/sass/**/*.scss', 'src/sass/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(concatCss("styles.css"))
        .pipe(gulp.dest('build/css/'))
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

gulp.task('build', gulp.parallel('html', 'sass', 'img', 'ico', 'js', 'pwa', 'sw'));

gulp.task('connect', function () {
    connect.server({
        root: 'build'
    })
});

gulp.task('default', gulp.series('build', 'connect'));