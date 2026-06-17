# Legado Linux 打包说明

> 本目录存放 deb / rpm / AppImage 三种 Linux 桌面分发格式的打包资源与构建说明。
> 所有打包命令通过根目录的 `Makefile` 编排，无需手动调用 jpackage / appimagetool。

---
标题: Legado Linux 打包资源说明
作者: nmb
日期: 2026-06-16
时间: 13:06:04
版本: v1.0
状态: 审核中
关联模块: packaging, Makefile
---

## 1. 支持的产物格式

| 格式 | 适用发行版 | 工具链 | 运行时依赖 | 产物路径 |
|---|---|---|---|---|
| `.deb` | Debian / Ubuntu / Deepin 等 | JDK21 自带 `jpackage` + `dpkg-deb` | 内置 JRE 21 | `packaging/dist/legado-linux_1.0.0-1_amd64.deb` |
| `.rpm` | Fedora / RHEL / openSUSE 等 | JDK21 `jpackage` + `rpmbuild` | 内置 JRE 21 | `packaging/dist/legado-linux-1.0.0-1.x86_64.rpm` |
| `.AppImage` | 所有发行版 (免安装单文件) | `appimagetool` | **系统需装 JRE 21+** | `packaging/dist/legado-linux-1.0.0-x86_64.AppImage` |

## 2. 目录结构

```
packaging/
├── legado-linux.svg          # 应用图标源文件 (SVG)
├── legado-linux.png          # 构建时生成的 512x512 PNG (由 Makefile 自动转换)
├── legado-linux.sh           # 启动器脚本 (兼作 AppImage 的 AppRun)
├── legado-linux.desktop      # XDG 桌面入口文件
├── README.md                 # 本文件
├── AppDir/                   # AppImage 临时组装目录 (构建产物, 可清理)
└── dist/                     # 最终安装包输出目录
```

## 3. 依赖安装

打包前请确保已安装基础依赖 (打包机, 非运行机):

```bash
# 图标转换 (三选一, 用于 SVG -> PNG)
sudo apt install librsvg2-bin       # rsvg-convert (推荐, 最轻量)
# 或: sudo apt install imagemagick  # convert
# 或: sudo apt install inkscape

# deb 打包
sudo apt install dpkg-dev

# rpm 打包
sudo apt install rpm      # Debian 系交叉打包
# 或在 Fedora: sudo dnf install rpm-build

# AppImage 打包
# 下载 appimagetool 并放到 PATH:
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage \
  -O ~/.local/bin/appimagetool
chmod +x ~/.local/bin/appimagetool
```

> `jpackage` 随 JDK 17+ 提供, 本项目要求 **JDK 21** (与 backend 编译目标一致)。

## 4. 构建命令

所有命令在 `Linux-legado实现/` 目录下执行:

```bash
make icon             # 单独生成 PNG 图标
make package-deb      # 仅构建 .deb
make package-rpm      # 仅构建 .rpm
make package-appimage # 仅构建 .AppImage
make package          # 自动检测工具链, 构建所有可用格式 (跳过缺依赖的)
```

> AppImage 默认构建 x86_64; 如需 arm64 产物, 用 `APP_ARCH=aarch64 make package-appimage` 覆盖。

每个打包目标都会自动: 构建后端 fat-jar → 生成 PNG 图标 → 打包 → 输出到 `packaging/dist/`。

## 5. 安装与运行

### deb
```bash
sudo dpkg -i packaging/dist/legado-linux_1.0.0-1_amd64.deb
# 桌面菜单将出现 "Legado Linux"; 或命令行运行:
legado-linux
# 卸载:
sudo apt remove legado-linux
```

### rpm
```bash
sudo rpm -i packaging/dist/legado-linux-1.0.0-1.x86_64.rpm
legado-linux
sudo rpm -e legado-linux
```

### AppImage
```bash
chmod +x packaging/dist/legado-linux-1.0.0-x86_64.AppImage
./packaging/dist/legado-linux-1.0.0-x86_64.AppImage
```

> AppImage 运行仍需目标机器预装 **JRE/JDK 21+** (未内置 JRE 以控制体积)。

## 6. 运行时行为

启动器 `legado-linux.sh` 会:
1. 在 `127.0.0.1:1122` 启动后端服务 (端口可由 `LEGADO_PORT` 覆盖);
2. 轮询端口就绪后, 调用 `xdg-open` 自动打开默认浏览器访问 SPA;
3. 数据存储于 `~/.legado/` (可由 `LEGADO_DATA_DIR` 覆盖)。

## 7. 清理

```bash
make clean    # 清理所有构建产物, 含 packaging/dist、AppDir、生成图标
```

## 变更日志

| 版本 | 日期 | 时间 | 作者 | 变更内容 |
|------|------|------|------|----------|
| v1.0 | 2026-06-16 | 13:06:04 | nmb | 初始版本 |
| v1.1 | 2026-06-17 | 14-30-00 | codewhale | package-appimage 显式传 `ARCH=$(APP_ARCH)` 给 appimagetool, 修复 AppRun 为脚本时无法推断架构导致 CI 失败; 产物名改用 `$(APP_ARCH)` 可配 |
