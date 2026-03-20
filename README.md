# 个人博客项目

主题使用[next](https://github.com/theme-next/hexo-theme-next)，进行了一些配置修改，以及[CSS样式覆盖](themes/next/source/css/custom.styl)。

渲染器使用自己fork修改的[hexo-renderer-markdown-it-jzj](https://github.com/jzj1993/hexo-renderer-markdown-it-jzj)，可以处理`source/_posts`中使用相对路径引用的图片文件，并自动复制到`public`目录。


## 文件夹组织

- `source`：博客文章源文件和图片存放位置，其中 `source/_posts` 为Markdown源文件和图片存放位置，配置了gitignore，本地软链接到实际的笔记目录。
- `source-test`：测试文章源文件和图片存放位置，用于开发测试
- `themes`：博客主题文件存放位置
- `public`：博客生成的静态文件存放位置
- `remote`：远程仓库数据存放位置，指向GitHub gh-pages分支的最新版本


## 相关命令

初始化：`./install.sh`

本地编译发布：`hexo clean && hexo generate && hexo server`

发布到GitHub Pages:

1. 全量发布：`hexo deploy`，重新生成博客文件，清空Git历史记录并push最新文件，需要消耗较多网络资源

1. 增量发布：`./deploy.sh "MESSAGE" full`，重新生成博客文件（运行 `hexo clean` + `hexo generate`），并增量上传到 GitHub

1. 快速增量发布（**默认模式**）：`./deploy.sh ["MESSAGE"] [fast]`（中括号参数均为可选，可以直接运行 `./deploy.sh`），增量生成博客文件（运行 `hexo generate`），并增量上传到 GitHub。可能会残留多余文件，但是速度最快


## 功能支持

1. [x] HTTPS
1. [x] 固定链接
1. [x] 文章目录
1. [x] 代码高亮
1. [x] MathJax
1. [x] 搜索
1. [x] 标签云
1. [x] 友情链接
1. [x] 相关文章
1. [x] 评论(valine)
1. [x] 阅读量(valine)
1. [x] 站点地图
1. [x] 搜索引擎SEO
1. [x] 增量deploy


## Git增量发布原理

直接用 hexo deploy 发布到 GitHub Pages 时，会先清空 gh-pages 分支的历史记录，再 push 最新生成的所有博客文件。

由于图片很多，导致每次发布都需要消耗较多网络资源。

增量发布脚本 `deploy.sh` 的原理是：


1. 调用 `hexo generate` 命令生成博客文件到 `public` 目录。
1. 调用 `git` 命令把 GitHub 的 gh-pages 分支最新版本保存到 `remote` 目录。
3. 把 `remote` 目录的 `.git` 软连接到 `public` 目录，让 git 计算 `public` 相对最新 `remote` 的改动文件。
4. 创建 git commit，只 push 改动的文件到 GitHub Pages。
