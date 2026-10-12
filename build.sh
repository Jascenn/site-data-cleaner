#!/usr/bin/env bash
# Site Data Cleaner — build & verify
# Usage: ./build.sh [--chrome] [--edge] [--all]
# Output: dist/site-data-cleaner-v<version>-chrome.zip / dist/site-data-cleaner-v<version>-edge.zip

set -euo pipefail
cd "$(dirname "$0")"

VERSION=$(node -p "require('./manifest.json').version")
mkdir -p dist
OUTDIR=dist

# 要打包的文件清单（与 manifest 声明一致，不包含 README/PRIVACY/screenshots）
FILES=(manifest.json background.js content.js popup.html popup.js options.html options.js icons/)

verify_manifest() {
  echo "→ verify:manifest"
  node - <<'NODE'
const fs = require('fs');
const m = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const errors = [];

// 必填字段
['manifest_version','name','version','description'].forEach(k => {
  if (!m[k]) errors.push(`missing ${k}`);
});
if (m.manifest_version !== 3) errors.push('manifest_version must be 3');
if (m.description.length > 132) errors.push(`description ${m.description.length} > 132 chars`);
if (m.name.length > 75) errors.push(`name ${m.name.length} > 75 chars`);

// icons 尺寸声明 vs 实际
if (m.icons) {
  for (const [size, path] of Object.entries(m.icons)) {
    if (!fs.existsSync(path)) { errors.push(`icon missing: ${path}`); continue; }
    // PNG 尺寸提取
    const buf = fs.readFileSync(path);
    if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) {
      errors.push(`icon not PNG: ${path}`); continue;
    }
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    if (w !== parseInt(size) || h !== parseInt(size)) {
      errors.push(`icon ${path}: manifest declares ${size}, actual ${w}x${h}`);
    }
  }
}

if (errors.length) {
  console.error('✗ manifest errors:');
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}
console.log('✓ manifest OK');
NODE
}

verify_zip() {
  local zip=$1
  echo "→ verify:zip $zip"
  [ -f "$zip" ] || { echo "✗ zip missing: $zip"; exit 1; }
  # manifest 在根
  unzip -l "$zip" | awk '{print $NF}' | grep -qx 'manifest.json' || { echo "✗ manifest not at zip root"; exit 1; }
  # 无 __MACOSX / .DS_Store
  if unzip -l "$zip" | grep -qE '__MACOSX|\.DS_Store'; then
    echo "✗ zip contains __MACOSX or .DS_Store"
    exit 1
  fi
  echo "✓ zip structure OK"
}

build_chrome() {
  local zip="$OUTDIR/site-data-cleaner-v${VERSION}-chrome.zip"
  echo "→ build:chrome $zip"
  rm -f "$zip"
  zip -r "$zip" "${FILES[@]}" -x '*.DS_Store' > /dev/null
  verify_zip "$zip"
  echo "✓ chrome zip ready: $zip"
}

build_edge() {
  local zip="$OUTDIR/site-data-cleaner-v${VERSION}-edge.zip"
  echo "→ build:edge $zip"
  rm -f "$zip"
  # Edge Add-ons 用同一套 MV3 源码；打包时替换 name/short_name/描述为 Edge 版
  rm -rf "$OUTDIR/edge-staging"
  mkdir -p "$OUTDIR/edge-staging"
  cp manifest.json background.js content.js popup.html popup.js options.html options.js "$OUTDIR/edge-staging/"
  cp -R icons "$OUTDIR/edge-staging/"
  # Edge 版本可以微调 name/description（可选），这里保持一致
  cd "$OUTDIR/edge-staging"
  zip -r "../site-data-cleaner-v${VERSION}-edge.zip" . -x '*.DS_Store' > /dev/null
  cd ../..
  rm -rf "$OUTDIR/edge-staging"
  verify_zip "$zip"
  echo "✓ edge zip ready: $zip"
}

case "${1:---all}" in
  --chrome) verify_manifest; build_chrome ;;
  --edge)   verify_manifest; build_edge ;;
  --all)    verify_manifest; build_chrome; build_edge ;;
  *) echo "Usage: $0 [--chrome|--edge|--all]"; exit 1 ;;
esac

echo
echo "All done. Output in dist/"
