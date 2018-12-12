let gulp = require('gulp');
let sass = require('gulp-sass');
let concatCss = require('gulp-concat-css');
let del = require('del');
let useRef = require('gulp-useref');
let gulpIf = require('gulp-if');
let uglify = require('gulp-uglify');
let cleanCss = require('gulp-clean-css');
let babel = require('gulp-babel');
let purify = require('gulp-purifycss');
let workboxBuild = require('workbox-build');

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
        src: 'src/js/*.js',
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
        .pipe(useRef())
        .pipe(gulpIf('*.js', babel({presets: ['@babel/env']})))
        .pipe(gulpIf('*.js', uglify()))
        .on('error', (error) => console.error(error))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
});

/**
 * SCSS to CSS task.
 */
gulp.task(tasks.scss, function () {
    return gulp.src(paths.scss.src)
        .pipe(sass())
        .pipe(concatCss("styles.min.css"))
        .pipe(purify(['src/**/*.js', 'src/**/*.html'], {minify: true}))
        .pipe(cleanCss({level: {1: {specialComments: 0}}}))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream())
});

/**
 * JS task
 */
gulp.task(tasks.js, function () {
    return gulp.src(paths.js.src)
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.js.dest))
        .pipe(browserSync.stream())
});

gulp.task('assets', function () {
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('build/'))
});

gulp.task('service-worker', () => {
    return workboxBuild.generateSW({
        importScripts: ['__precacheManifest.js'],
        swDest: 'build/sw.js',
        globDirectory: 'build',
        globPatterns: [
            '**/*.{html,css,js,png,svg,jpeg,json}',
        ],
        ignoreUrlParametersMatching: [/^id/],
        runtimeCaching: [
            {
                /* Google Fonts */
                urlPattern: new RegExp('^https:\\/\\/fonts\\.googleapis\\.com'),
                handler: 'staleWhileRevalidate',
                options: {
                    cacheName: 'gfonts'
                }
            },
            {
                /* HTML files */
                urlPattern: new RegExp('\\.(?:html)$'),
                handler: 'staleWhileRevalidate'
            },
            {
                /* CSS, JS, JSON files */
                urlPattern: new RegExp('\\.(?:js|css|json)$'),
                handler: 'staleWhileRevalidate',
                options: {
                    cacheName: 'static-resources',
                    expiration: {
                        maxAgeSeconds: 7 * 24 * 60 * 60,
                    }
                }
            },
            {
                /* External resources */
                urlPattern: new RegExp('.*(?:ajax.googleapis|googleapis|unpkg|cdnjs.cloudflare)\\.com'),
                handler: 'staleWhileRevalidate',
                options: {
                    cacheName: 'static-resources',
                    expiration: {
                        maxAgeSeconds: 7 * 24 * 60 * 60,
                    }
                }
            },
            {
                /* Icons & Images */
                urlPattern: new RegExp('.*\\.(?:png|svg|gif|jpg|jpeg)$'),
                handler: 'staleWhileRevalidate',
                options: {
                    cacheName: 'image-cache',
                    expiration: {
                        maxAgeSeconds: 7 * 24 * 60 * 60,
                    }
                }
            }
        ]
    });
});

gulp.task('build', gulp.parallel(tasks.html, tasks.scss, tasks.js, 'assets', 'service-worker'));

gulp.task('clean', function () {
    return del('build/**/*', {
        force: true
    });
});

gulp.task('clean:build', gulp.series('clean', 'build'));

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