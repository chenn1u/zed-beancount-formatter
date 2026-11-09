#!/usr/bin/env bash
# 给 beancount-language-server 打上拼音首字母补全补丁并本地编译。
# 产物：bin/beancount-language-server，在 Zed 设置里通过 lsp.beancount-language-server.binary.path 指定。
set -euo pipefail

# 上游基线版本，升级时改这里并重新生成 patches/pinyin-completion.patch
PIN=a01a499356397d7299a0b4c473be7eb3af5efc51

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SRC="$ROOT/.build/beancount-language-server"
PATCH="$ROOT/patches/pinyin-completion.patch"

if [ ! -d "$SRC/.git" ]; then
  git clone https://github.com/polarmutex/beancount-language-server "$SRC"
fi

git -C "$SRC" fetch --depth 1 origin "$PIN"
git -C "$SRC" checkout -q "$PIN"
git -C "$SRC" checkout -q -- .
git -C "$SRC" clean -qfd
git -C "$SRC" apply "$PATCH"

cargo build --release --manifest-path "$SRC/Cargo.toml" -p beancount-language-server

mkdir -p "$ROOT/bin"
cp "$SRC/target/release/beancount-language-server" "$ROOT/bin/"
echo "已生成 $ROOT/bin/beancount-language-server"
echo "在 Zed settings.json 中配置："
echo "  \"lsp\": { \"beancount-language-server\": { \"binary\": { \"path\": \"$ROOT/bin/beancount-language-server\" } } }"
