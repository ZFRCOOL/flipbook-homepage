# 御风·Future｜翻书个人主页

React 19、TypeScript、Vite、Tailwind CSS 4 和 react-pageflip 构建的纯前端个人主页。

## 本地运行

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

打开终端显示的地址，路径为 `/flipbook-homepage/`。页面不调用 AI API，不需要 Gemini API Key，也不需要后端服务。部分依赖来自原始生成模板，保留锁文件以便复现。

## 构建与预览

```sh
npm run lint
npm run build
npm run preview
```

构建输出在 `dist/`，预览路径为 `/flipbook-homepage/`。`vite preview` 仅用于本地验收。

## 上线

仓库 Settings → Pages → Source 选择 GitHub Actions。
推送到 `main` 后，`.github/workflows/deploy.yml` 自动安装依赖、检查类型、构建并发布。

网址：https://zfrcool.github.io/flipbook-homepage/

Vite 的 `base` 设为 `/flipbook-homepage/`，头像使用 `import.meta.env.BASE_URL`，避免子目录部署时丢失图片。更改仓库名或切换独立域名时，需要同步修改 `base`。

不要上传真实密钥、`.env.local`、`node_modules` 或编辑器配置。联系页目前保留原型中的示例邮箱及展示项，尚未接入真实联系方式。
