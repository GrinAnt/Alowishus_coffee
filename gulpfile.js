const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const svgo = require("gulp-svgo");
const svgSprite = require("gulp-svg-sprite");
const sassGlob = require("gulp-sass-glob");
var csscomb = require("gulp-csscomb");

// ОБРАБОТКА ФАЙЛОВ JAVASCRIPT
function scripts() {
  return (
    src(["app/js/**/*.js", "!app/js/main.min.js"])
      .pipe(concat("main.min.js"))
      // .pipe(uglify())  //минификация js
      .pipe(dest("app/js"))
      .pipe(browserSync.stream())
  );
}

// ОБРАБОТКА ФАЙЛОВ СТИЛЕЙ
// const source = ["node_modules/normalize.css/normalize.css", "app/scss/main.scss"];

function styles() {
  return (
    src("app/scss/main.scss")
      .pipe(autoprefixer({ overrideBrowsersList: ["last 10 version"] }))
      .pipe(concat("style.min.css"))
      .pipe(
        sassGlob({
          ignorePaths: ["main.scss"],
        })
      )

      .pipe(scss())
      // .pipe(scss({ outputStyle: "compressed" }))  //минификация css
      .pipe(csscomb())
      .pipe(dest("app/css"))
      .pipe(browserSync.stream())
  );
}

// РАБОТА С ИЗОБРАЖЕНИЯМИ
function images() {
  return src("src/img/svg/*.svg")
    .pipe(
      svgo({
        plugins: [
          {
            removeAttrs: {
              attrs: "(fill|stroke|style|width|height|data.*)",
            },
          },
        ],
      })
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("src/img/svg"))
    .pipe(browserSync.stream());
}

// ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ ФАЙЛОВ И АВТОМАТИЧЕСКАЯ ИХ ОБРАБОТКА
function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/main.js", "!app/js/main.min.js"], scripts);
  watch(["app/*.html"]).on("change", browserSync.reload);
  watch(["src/img/svg/*.svg"], images);
}

// АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ СТРАНИЦЫ В БРАУЗЕРЕ
function browser() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

// ОЧИЩАЕТ СОДЕРЖИМОЕ УКАЗАННОЙ ПАПКИ
function cleanDist() {
  return src("dist/*").pipe(clean());
}

// ПЕРЕНОСИТ ФАЙЛЫ, КОТОРЫЕ БУДУТ ОТПРАВЛЕНЫ НА ХОСТИНГ ИЛИ ОТДАВАТЬСЯ КЛИЕНТУ В ПАПКУ DIST (ЧИСТОВИК)
function building() {
  return src(["app/css/style.min.css", "src/img/**/*", "app/js/main.min.js", "app/*.html"], { base: "app" }).pipe(
    dest("dist")
  );
}

exports.styles = styles;
exports.scripts = scripts;
exports.scripts = images;
exports.watching = watching;
exports.browser = browser;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, images, browser, watching);

//
//
//
// ДЛЯ ЗАПУСКА ЗАДАЧИ ПЕРЕНОСА ПРОЕКТА В ПАКУ DIST (ЧИСТОВИК) В КОНСОЛИ НЕОБХОДИМО НАБРАТЬ КОМАНДУ - GULP BUILD
// ДЛЯ ЗАПУСКА ВЫПОЛНЕНИЯ ЗАДАЧ В КОНСОЛИ НЕОБХОДИМО НАБРАТЬ КОМАНДУ - GULP
