const gulp = require("gulp")
const ts = require("gulp-typescript")
const sourcemaps = require("gulp-sourcemaps")
const tsProject = ts.createProject("tsconfig.json")
const del = require("del")

const DIST = "dist"

gulp.task("clean", () => {
  return del("dist/**", { force: true })
})

gulp.task("copy-css", () => {
  return gulp.src("src/default.css").pipe(gulp.dest(DIST))
})

gulp.task("copy-exports", () => {
  return gulp.src("src/exports.js").pipe(gulp.dest(DIST))
})

gulp.task("copy-html", () => {
  return gulp.src("src/window.html").pipe(gulp.dest(DIST))
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
  gulp.series("clean", gulp.parallel("tsc", "copy-html", "copy-exports", "copy-css")),
)
