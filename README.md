# 🎬 我的电影库

个人电影收藏与管理网站，支持 TMDB API 自动检索电影详情。

## ✨ 功能

- 🔍 **电影搜索** — 输入电影名，自动从 TMDB 获取海报、简介、评分、时长、演员信息
- 📋 **清单管理** — "想看"和"已看"两个清单，一键切换状态
- 🖼️ **瀑布流海报墙** — 支持全部/已看/想看筛选，无缝切换
- 🎲 **随机抽选** — 从全部/已看/想看中随机抽取，选择困难症救星
- 📊 **统计面板** — 电影总数、观影时长、平均评分、类型分布
- 📝 **个人笔记** — 给每部电影写自己的短评
- 🌓 **暗色模式** — 手动切换，也支持跟随系统

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装

```bash
git clone https://github.com/nov1ce-lee/movie-site.git
cd movie-site
npm install
```

### 配置 TMDB API

1. 前往 [TMDB 设置页](https://www.themoviedb.org/settings/api) 申请 API 密钥
2. 在项目根目录创建 `.env.local` 文件：

```bash
TMDB_API_READ_TOKEN=你的Bearer读令牌
TMDB_API_KEY=你的API密钥

# 中国大陆用户需要配置代理
TMDB_HTTP_PROXY=http://127.0.0.1:7890
```

3. 启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 生产构建

```bash
npm run build
npm start
```

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 全栈框架 |
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Tailwind CSS v4 | 样式与暗色模式 |
| SQLite (better-sqlite3) | 数据持久化 |
| TMDB API v3 | 电影数据检索 |

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页 — 瀑布流海报墙
│   ├── layout.tsx            # 根布局 + 暗色模式脚本
│   ├── add/page.tsx          # 添加电影页
│   ├── random/page.tsx       # 随机抽选页
│   ├── stats/page.tsx        # 统计面板页
│   ├── movie/[id]/page.tsx   # 电影详情页
│   └── api/                  # 后端 API
│       ├── movies/           # 电影 CRUD
│       ├── stats/            # 统计数据
│       ├── random/           # 随机抽取
│       └── tmdb/             # TMDB 搜索代理
├── components/               # React 组件
│   ├── Navbar.tsx
│   ├── ThemeToggle.tsx
│   ├── MovieCard.tsx
│   └── MovieGrid.tsx
└── lib/
    ├── db.ts                 # SQLite 数据库操作
    └── tmdb.ts               # TMDB API 客户端
```

## 📄 协议

MIT License
