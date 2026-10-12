# Site Data Cleaner — 问题沉淀与发布流程

> 2026-10-12 v1.2.0 发版记录。按"问题 → 原因 → 解决方案"格式沉淀，供后续迭代参考。

## 问题 → 原因 → 解决方案

### 1. manifest description 超限
- **问题**: CWS/Edge 商店 description 上限 132 字符，实际 190 字符，直接拒审。
- **原因**: 初版把完整功能描述塞进了 manifest。
- **解决**: 压缩到 87 字符，只保留核心卖点；`build.sh` verify:manifest 加断言防止回退。

### 2. 图标尺寸与 manifest 声明不匹配
- **问题**: manifest 声明 16/48/128，实际 PNG 是 32/96/256。审核警告 + 商店展示变形。
- **原因**: 图标生成流程没按 manifest 反推尺寸。
- **解决**: 用 `sips` 重采样到声明尺寸；`build.sh` 逐个读 PNG 头断言宽高与 manifest 一致。

### 3. 截图尺寸不符
- **问题**: CWS/Edge 要求 1280×800（或 640×400），popup 664×480、options 1400×1274。
- **原因**: 截图是浏览器窗口原生大小，没对齐商店规格。
- **解决**: `sips` 重采样 + `--padToHeightWidth` 白底填充到 1280×800。

### 4. HTTP 磁盘缓存未清理
- **问题**: "清完重载"后仍拿到缓存的旧 JS/CSS，调试场景目标没达成。
- **原因**: `browsingData.remove` 只清了 `cacheStorage`（Cache API），没传 `cache: true`（HTTP 磁盘缓存）。查官方文档确认 `cache` 属于 `origins` 参数支持的 cookies/cache/storage 三类之一，按 origin 清不会误伤其他站点。
- **解决**: `background.js` 数据类型加 `cache: true`。

### 5. 公共后缀域名处理粗糙
- **问题**: `bbc.co.uk` 这类域名会被 `split('.').slice(-2)` 算出 `co.uk`，root 级清理落空。
- **原因**: 简单取后两段，没考虑两部分公共后缀。
- **解决**: 新增 `registrableDomain()` + 27 个常见两部分后缀表（co.uk/com.cn/com.au 等）。冷门后缀退回旧行为，不出错。10/10 测试用例通过。

### 6. 无构建/验证脚本
- **问题**: 每次发版手工 zip，容易漏文件、包结构不一致。
- **原因**: 没沉淀自动化流程。
- **解决**: `build.sh` 一键 `--chrome/--edge/--all`，内置 verify:manifest（description 上限、图标尺寸断言）+ verify:zip（manifest 在根、无 __MACOSX/.DS_Store）。

### 7. Edge 平台无支持
- **问题**: 只有 Chrome 流程文档，Edge Add-ons 无法直接提交。
- **原因**: MV3 本身跨浏览器兼容，缺的只是打包和文档。
- **解决**: `build.sh` 产双 zip；`PUBLISHING.md` 补 Edge Partner Center 提交指南。

## 发布流程（v1.2.0 实际执行）

```bash
./build.sh --all              # verify + 产双 zip
git add -A && git commit      # 待用户确认
git tag v1.2.0 && git push origin main --tags
# GitHub Release 由 workflow 自动创建
```

## 商店提交通路

- **Chrome Web Store**: https://chrome.google.com/webstore/devconsole，上传 `dist/site-data-cleaner-v1.2.0-chrome.zip`
- **Edge Add-ons**: https://partner.microsoft.com/dashboard/microsoftedge，上传 `dist/site-data-cleaner-v1.2.0-edge.zip`
- **隐私政策 URL**（双平台必填）: `https://github.com/Jascenn/site-data-cleaner/blob/main/PRIVACY.md`
- 逐 tab 填写口径见 `PUBLISHING.md`
