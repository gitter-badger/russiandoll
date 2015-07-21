var gulp        = require('gulp')
  , sourcemaps  = require('gulp-sourcemaps')
  , babel       = require('gulp-babel')
  , concat      = require('gulp-concat')
  , uglify      = require('gulp-uglify');

gulp.task('default', function () {

  var version = (require('./package.json') || {})['version'];

  return gulp.src('src/**/*.+(js|es)')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('russiandoll-' + version + '.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));

});
