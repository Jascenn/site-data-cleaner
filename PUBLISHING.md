# 发布指南 — Chrome Web Store & Edge Add-ons

> 上传包由 `./build.sh --all` 产出，位于 `dist/`。版本号唯一来源：`manifest.json` 的 `version`。

## 0. 发版流程

```bash
# 1. 确认工作区干净
git status --short

# 2. 版本 bump（manifest.json + CHANGELOG.md 顶部新条目）

# 3. 构建与验证
./build.sh --all

# 4. 提交 + tag（版本相关变更一起提交）
git add -A && git commit -m "Release v<version>"
git tag v<version> && git push origin main --tags
# GitHub Release 由 .github/workflows/release.yml 自动创建，附双 zip
```

## 1. Chrome Web Store

入口：https://chrome.google.com/webstore/devconsole（需一次性 $5 注册费）

| 项目 | 内容 |
|---|---|
| 上传包 | `dist/site-data-cleaner-v<version>-chrome.zip` |
| 商品详情 → 说明 | 取自 manifest（自动）；详细描述可基于 README Features 段 |
| 类别 | 效率工具 / Productivity |
| 语言 | English（或加 zh-CN） |
| 截图 | `screenshots/popup.png`、`screenshots/options.png`（1280×800 ✓） |
| 图标 | `icons/icon128.png`（128×128 ✓） |
| 隐私权 tab | 见下方「隐私口径」 |
| 隐私政策 URL | `https://github.com/Jascenn/site-data-cleaner/blob/main/PRIVACY.md`（必填） |
| 分发 | 免费 / 公开 / 全球 |

### 隐私口径（Privacy tab）

- **Single purpose**: Clear browsing data (cookies, storage, cache) for the site the user is viewing, on explicit user action.
- **权限理由**（逐条对应 manifest 权限）:
  - `cookies` — Enumerate and remove cookies for the current site when the user triggers a clear.
  - `scripting` — Inject a reload script into the active tab after clearing.
  - `activeTab` — Access the currently focused tab's URL to determine which site to clean.
  - `browsingData` — Clear localStorage, IndexedDB, cache storage, and service workers per origin.
  - `storage` — Persist the user's silent-list (hostname list) via chrome.storage.sync.
  - `tabs` — Read the active tab's URL to determine the hostname.
- **Host permissions `<all_urls>`**: The extension operates on whatever site the user is viewing when they invoke it — the choice of site belongs to the user, so the host set cannot be pre-narrowed. It does not read or transmit page content.
- **Remote code**: No.
- **Data usage**: 不勾任何收集类别（不收集个人身份信息、健康、财务、通讯、位置、历史、活动、网站内容、身份验证信息）。扩展只在用户动作时删除本地站点数据，不读取、不上传。
- **Limited use**: 三条必勾。

## 2. Edge Add-ons

入口：https://partner.microsoft.com/dashboard/microsoftedge（需 Microsoft 账号，注册免费）

| 项目 | 内容 |
|---|---|
| 上传包 | `dist/site-data-cleaner-v<version>-edge.zip` |
| 名称 | Site Data Cleaner（自动取自 manifest） |
| 简短描述 | 自动取自 manifest（87 字符，Edge 上限 132 ✓） |
| 详细描述 | 可用 README Features 段 |
| 类别 | Productivity |
| 截图 | `screenshots/popup.png`、`screenshots/options.png`（Edge 要求 1280×800 或 640×480，1280×800 ✓） |
| Logo | `icons/icon128.png`（Edge 要求 128×128 ✓） |
| 隐私政策 URL | `https://github.com/Jascenn/site-data-cleaner/blob/main/PRIVACY.md`（必填） |
| 商店语言 | English |
| 可见性 | Public |

Edge 审核 1–7 天。MV3 与 Chrome 完全兼容，本扩展未用 Chrome 专有 API，双 zip 内容一致，无需代码改动。

## 3. 提交前 checklist

- [ ] `./build.sh --all` 全绿
- [ ] CHANGELOG.md 顶部有对应版本条目
- [ ] 截图/图标尺寸与 manifest 声明一致（build.sh 已断言）
- [ ] 隐私政策 URL 指向当前 main 分支 PRIVACY.md
- [ ] 权限理由与 manifest 权限一一对应（无遗漏）
- [ ] zip 根有 manifest.json、无 __MACOSX / .DS_Store（build.sh 已断言）

## 4. 被拒后处理

1. 读拒绝原因，回 PRIVACY.md / README 核对事实层
2. 改文案层或代码层，版本号按语义 +0.0.1
3. 重新 `./build.sh --all` → 重新提交
