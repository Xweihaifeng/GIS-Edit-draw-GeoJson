
babel ES6转码，及压缩生成min包

一、ES6转码准备：
    1、node安装:
        32 位安装包下载地址 : https://nodejs.org/dist/v4.4.3/node-v4.4.3-x86.msi
        64 位安装包下载地址 : https://nodejs.org/dist/v4.4.3/node-v4.4.3-x64.msi
    2、npm国内镜像（cnpm）：
        npm install -g cnpm --registry=https://registry.npm.taobao.org
    3、安装模块：
        cnpm install [name] （cnpm install -d）

二、ES6转码阶段：
    1、npm init：项目的目录中生成package.json文件
    2、npm install -g babel-cli：安装babel-cli用于命令行转码
    3、npm install --save-dev babel-cli：babel-cli 需要全局安装 -g代表 -global。需要在项目中也安装babel-cli
    4、npm install --save-dev babel-preset-es2015：安装转码规则
    5、babelrc：src同级目录创建（.babelrc）文件
        {
            "presets":[ "es2015" ],
            "plugins":[]
        }
    6、配置package.json文件
        {
            "name": "indoorplanning",
            "version": "1.0.0",
            "description": "",
            "main": "index.js",
            "scripts": {
                "build": "babel js\\myjs -o js\\index.js", //将js/myjs文件夹下面的ES6语法(所有js文件)转码成(index.js)一个文件
                "build": "babel js\\myjs -out-dir js\\dist",  //将js/myjs文件夹下面的ES6语法(所有js文件)转码到js/dist文件夹下

                "minjs": "gulp minifyjs" //压缩生成min包时运行
            },
            "author": "",
            "license": "ISC",
            "devDependencies": {
                "babel-cli": "^6.26.0",
                "babel-preset-es2015": "^6.24.1",
                "gulp": "^4.0.0",
                "gulp-clean": "^0.4.0",
                "gulp-concat": "^2.6.1",
                "gulp-jshint": "^2.1.0",
                "gulp-minify-css": "^1.2.4",
                "gulp-notify": "^3.2.0",
                "gulp-rename": "^1.4.0",
                "gulp-uglify": "^3.0.1"
            }
        }
    7、运行cnpm run build转码

三、压缩生成min包：
    1、npm install --global gulp：首页全局安装gulp --（可有可以）
    2、npm install gulp --save-dev：其次局部安装gulp
    3、npm install gulp-minify-css --save-dev：压缩css
    4、npm install gulp-jshint --save-dev：检查js --（可有可以）
    5、npm install gulp-uglify --save-dev：压缩js
    7、npm install gulp-concat --save-dev：合并文件 --（可有可以）
    6、npm install gulp-rename --save-dev：重命名文件 --（可有可以）
    8、npm install gulp-clean --save-dev：清空文件夹 --（可有可以）
    9、npm install gulp-notify --save-dev：提示 --（可有可以）
    10、gulpfile.js：src同级目录创建（gulpfile.js）文件
        var gulp = require('gulp');
        var concat = require('gulp-concat'); //合并文件
        var rename = require('gulp-rename'); //文件重命名
        var uglify = require('gulp-uglify'); //js压缩
        var minifycss = require('gulp-minify-css'); //css压缩

        /**
         * 压缩js(css压缩原理类同)
         * 解压文件路径： ['./js/index.js'] js多个文件进行压缩
         * 解出文件路径： ./js
         */
        gulp.task('minifyjs', function() {
            return gulp.src(['./js/index.js']) //压缩多个文件
                .pipe(concat('index.js')) //合并js
                .pipe(gulp.dest('./js')) //输出
                .pipe(rename({ suffix: '.min' })) //重命名
                .pipe(uglify()) //压缩
                .pipe(gulp.dest('./js')); //输出
        });
    11、运行cnpm run minjs压缩生成index.min.js包