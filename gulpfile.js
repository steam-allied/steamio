/* Created by Sergey on 15.05.2017.*/

/*===========GULP==============*/
const gulp = require('gulp'),
	sass = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	imagemin = require('gulp-imagemin'),
	prefixer = require('gulp-autoprefixer'), // automatically prefixes to css properties
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	zip = require('gulp-zip'),
	replace = require('gulp-replace'),
	cache = require('gulp-cache');


/*===========Compile SCSS==============*/


gulp.task('sass', function(cb) {

    gulp.src('html/sass/**/*.scss')
        .pipe(sass(
			{
				linefeed: "crlf"
			}
		))
		.pipe(prefixer(
			{
				overrideBrowserslist: ['last 12 versions'],
				cascade: false
			}
		))
        .pipe(gulp.dest('html/css'))
        .pipe(plumber())
        .pipe(sass({errLogToConsole: true}))
        .pipe(browserSync.reload({
            stream: true
        }));
	cb();
});

/*/!*===========Watch==============*!/*/

gulp.task('watch', function(cb) {

	browserSync.init({
		server: "./html"
	});

	gulp.watch('html/sass/**/*.scss', gulp.series('sass'));
	cb();
});

/*/!*===========Minimization IMAGE==============*!/*/

gulp.task('images', function (cb) {
	gulp.src('html/img/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(cache(imagemin({
			interlaced: true
		})))
		.pipe(gulp.dest('html/img'));
	cb();
});


/*/!*=============Join tasks==============*!/*/


gulp.task('default', gulp.parallel('sass', 'watch'));

gulp.task('build', gulp.series( 'sass', 'images'));


/*============= Tasks for TF ==============*/

gulp.task('inject-analytics', function (cb) {
	gulp.src('html/*.html')
		.pipe(replace(/(\<head[^\>]*\>)/g, '$1\n<!-- Google Tag Manager -->\n' +
			'<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':\n' +
			'new Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],\n' +
			'j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=\n' +
			'\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);\n' +
			'})(window,document,\'script\',\'dataLayer\',\'GTM-TKGD7NP\');</script>\n' +
			'<!-- End Google Tag Manager -->'))

		.pipe(replace(/(\<body[^\>]*\>)/g, '$1\n<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TKGD7NP" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->'))
		.pipe(gulp.dest('HTML-promo/'));

	cb();
});

gulp.task('copy-files', function(cb) {

	gulp.src([
			'html/**',
			'licensing/**',
			'Documentation/**',
			'gulpfile.js',
			'package.json'
		],
		{
			base: './'
		})
		.pipe(gulp.dest('HTML-tf/'));

	gulp.src('html/**/*')
		.pipe(gulp.dest('HTML-promo/'));

	cb();
});

gulp.task('encrypt-project', function(cb) {
	gulp.src(['html/js/main.js', 'encrypt-project.js'])
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('HTML-promo/js/'));

	cb();
});

gulp.task('copy-images', function(cb) {
	gulp.src('img-no-image/**/*')
		.pipe(gulp.dest('HTML-tf/html/img'));

	cb();
});

gulp.task('zip', function (cb) {
	gulp.src('HTML-promo/**')
		.pipe(zip('html-promo.zip'))
		.pipe(gulp.dest('./'));

	gulp.src('HTML-tf/**')
		.pipe(zip('html-tf.zip'))
		.pipe(gulp.dest('./'));

	cb();
});

gulp.task('copy-projects', gulp.series('copy-files'));

gulp.task('inject-analytics', gulp.series('inject-analytics'));

gulp.task('encryptor-zip', gulp.series('copy-images', 'encrypt-project', 'zip'));