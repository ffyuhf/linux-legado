#!/usr/bin/env bash
#
# Legado Linux 启动器脚本
# 定位 fat-jar、启动后端服务、自动打开浏览器
# 同时作为 AppImage 的 AppRun 入口
#
# 创建日期: 2026-06-16
# 修改历史:
# 2026-06-16 13:06:04 nmb - 初始版本

set -euo pipefail

# 解析脚本所在目录; AppImage 运行时资源挂载于 $APPDIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPDIR="${APPDIR:-${SCRIPT_DIR}}"

# 1. 定位 fat-jar: 优先 jar 同目录, 其次 AppDir 内标准路径, 最后项目构建目录 (开发场景)
JAR="${LEGADO_JAR:-}"
if [[ -z "$JAR" ]]; then
  for candidate in \
      "${APPDIR}/usr/lib/legado-linux/legado-linux-1.0.0-all.jar" \
      "${APPDIR}/legado-linux-1.0.0-all.jar" \
      "${APPDIR}/../backend/build/libs/legado-linux-1.0.0-all.jar"; do
    if [[ -f "$candidate" ]]; then
      JAR="$candidate"
      break
    fi
  done
fi

if [[ -z "$JAR" || ! -f "$JAR" ]]; then
  echo "✗ 未找到 legado fat-jar, 请设置 LEGADO_JAR 环境变量指向 jar 路径" >&2
  exit 1
fi

# 2. 运行参数 (环境变量可覆盖, 默认监听本机便于桌面浏览器访问)
: "${LEGADO_PORT:=1122}"
: "${LEGADO_HOST:=127.0.0.1}"
: "${LEGADO_DATA_DIR:=${HOME}/.legado}"

# 3. 检查 java 可用
if ! command -v java >/dev/null 2>&1; then
  echo "✗ 未找到 java, 请安装 JDK/JRE 21+" >&2
  exit 1
fi

# 4. 启动后端服务 (后台)
echo "==> 启动 Legado Linux (端口 ${LEGADO_PORT})"
java -Dlegado.port="${LEGADO_PORT}" \
     -Dlegado.host="${LEGADO_HOST}" \
     -Dlegado.dataDir="${LEGADO_DATA_DIR}" \
     -jar "$JAR" >/dev/null 2>&1 &
APP_PID=$!

# 5. 等待端口就绪后打开浏览器
for _ in $(seq 1 15); do
  if curl -s "http://${LEGADO_HOST}:${LEGADO_PORT}" >/dev/null 2>&1; then
    URL="http://127.0.0.1:${LEGADO_PORT}"
    echo "==> 服务就绪, 打开浏览器: ${URL}"
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$URL" >/dev/null 2>&1 || true
    fi
    break
  fi
  sleep 1
done

# 6. 随主进程退出
wait "$APP_PID"
