# AmphionASR Demo Page

> **Demo Page**: <https://asd5152306.github.io/amphionasr/>
>
> **Source Repo**: <https://github.com/asd5152306/amphionasr>

静态展示型 demo page，用于论文配套展示。基于纯 HTML/CSS/JS，已部署到 GitHub Pages，通过 GitHub Actions 自动构建发布。

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

本仓库已配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），push 到 `main` 分支后会自动触发部署。

**当前部署状态**：
- 仓库：<https://github.com/asd5152306/amphionasr>
- 访问地址：<https://asd5152306.github.io/amphionasr/>
- Pages Source：GitHub Actions

**首次部署的开启步骤**（已完成，仅供参考）：
1. 仓库 Settings → Pages → Source 选择 `GitHub Actions`
2. push 代码到 `main` 分支，workflow 自动构建并部署

**更新页面**：
```bash
git add .
git commit -m "update: 描述改动"
git push
```
push 后 1-2 分钟内自动重新部署。

## 自定义

- 修改 `index.html` 中的论文标题、作者、链接
- 编辑 `data/examples.json` 添加/修改示例
- 修改 `css/style.css` 调整主题色
