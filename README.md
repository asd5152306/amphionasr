# AmphionASR Demo Page

静态展示型 demo page，用于论文配套展示。基于纯 HTML/CSS/JS，可直接部署到 GitHub Pages。

## 目录结构

```
amphion-asr-1.7b/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式
├── js/
│   └── main.js             # 交互逻辑
├── data/
│   └── examples.json       # 示例数据（音频路径、转录文本、指标）
├── assets/
│   ├── samples/            # 示例音频（待填充）
│   ├── figures/            # 论文图片（待填充）
│   └── logo.png            # logo（待填充）
├── .nojekyll               # 禁用 GitHub Pages 的 Jekyll
└── README.md
```

## 待填充内容

1. `data/examples.json`：每种能力的示例音频路径、转录文本、对比指标
2. `assets/samples/`：示例音频文件（建议 .mp3，5-15s，单文件 < 1MB）
3. `assets/figures/`：架构图、能力图（可从论文 figures 目录复制）
4. `assets/logo.png`：项目 logo
5. `index.html` 顶部的论文链接、代码链接、BibTeX

## 本地预览

```bash
cd /chenmingjie/lx/demo_page/amphion-asr-1.7b
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 将本目录内容 push 到仓库的 `gh-pages` 分支或 `docs/` 目录
2. 仓库 Settings → Pages → Source 选择对应分支
3. 访问 `https://<user>.github.io/<repo>/`

## 自定义

- 修改 `index.html` 中的论文标题、作者、链接
- 编辑 `data/examples.json` 添加/修改示例
- 修改 `css/style.css` 调整主题色
