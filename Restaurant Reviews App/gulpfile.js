let gulp = require('gulp');
let sass = require('gulp-sass');
let concatCss = require('gulp-concat-css');
let del = require('del');

let browserSync = require('browser-sync').create();

/**
 * Path constants for sources and destinations.
 * @type {{html: {src: string, dest: string}, scss: {src: string[], dest: string}}}
 */
let paths = {
    html: {
        src: 'src/*.html',
        dest: 'build/'
    },
    scss: {
        src: 'src/sass/*.scss',
        dest: 'build/css/'
    },
    js: {
        src: 'src/js/**/*.js',
        dest: 'build/js'
    }
};

/**
 * Constants for task names.
 * @type {{html: string, scss: string}}
 */
let tasks = {
    html: 'html',
    scss: 'scss',
    js: 'js'
};

/**
 * HTML task.
 */
gulp.task(tasks.html, function () {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest))

});

/**
 * SCSS to CSS task.
 */
gulp.task(tasks.scss, function () {
    return gulp.src(paths.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(concatCss("styles.css"))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream())

});

/**
 * JS task
 */
gulp.task(tasks.js, function () {
    return gulp.src(paths.js.src)
        .pipe(gulp.dest(paths.js.dest))
        .pipe(browserSync.reload({stream: true}))
});

gulp.watch(paths.js.src, gulp.series(tasks.js));

gulp.task('assets', function () {
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('build/'))
});

gulp.task('sw', function () {
    return gulp.src('src/service-worker.js')
        .pipe(gulp.dest('build/'))
});

gulp.task('build', gulp.parallel(tasks.html, tasks.scss, tasks.js, 'assets', 'sw'));

gulp.task('clean:build', function() {
    return del('build/**/*', {
        force: true
    });
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 'build'
        }
    });

    gulp.watch(paths.html.src, gulp.series(tasks.html));
    gulp.watch(paths.scss.src, gulp.series(tasks.scss));
    gulp.watch(paths.js.src, gulp.series(tasks.js));
});

gulp.task('default', gulp.series('clean:build', 'build', 'browserSync'));