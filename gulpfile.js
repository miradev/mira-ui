const gulp = require("gulp")
const ts = require("gulp-typescript")
const sourcemaps = require("gulp-sourcemaps")
const tsProject = ts.createProject("tsconfig.json")
const del = require("del")
const path = require("path")

const DIST = "dist"
const DIST_RENDERER = path.join(DIST, "renderer")
const DIST_RENDERER_SETUP = path.join(DIST_RENDERER, "setup")

gulp.task("clean", () => {
  return del("dist/**", { force: true })
})

gulp.task("copy-css", () => {
  return gulp.src("src/renderer/default.css").pipe(gulp.dest(DIST_RENDERER))
})

gulp.task("copy-exports", () => {
  return gulp.src("src/renderer/exports.js").pipe(gulp.dest(DIST_RENDERER))
})

gulp.task("copy-html", () => {
  return gulp.src("src/renderer/index.html").pipe(gulp.dest(DIST_RENDERER))
})

gulp.task("copy-runtime-scripts", () => {
  return gulp
    .src([
      "src/renderer/vue.runtime.min.js",
      "src/renderer/axios.min.js",
      "src/renderer/moment-with-locales.min.js",
    ])
    .pipe(gulp.dest(DIST_RENDERER))
})

gulp.task("copy-setup", () => {
  return gulp
    .src([
      "src/renderer/setup/default.css",
      "src/renderer/setup/qrcode.min.js",
      "src/renderer/setup/index.html",
    ])
    .pipe(gulp.dest(DIST_RENDERER_SETUP))
})

gulp.task("tsc", () => {
  const tsResult = gulp
    .src("src/**/*.ts")
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(tsProject())

  return tsResult.js.pipe(sourcemaps.write("./")).pipe(gulp.dest(DIST))
})

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel(
      "tsc",
      "copy-html",
      "copy-runtime-scripts",
      "copy-exports",
      "copy-css",
      "copy-setup",
    ),
  ),
)
