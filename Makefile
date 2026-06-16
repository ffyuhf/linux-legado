# Makefile - Legado Linux 构建与运行编排
# 创建日期: 2026-06-16
# 说明: 统一编排 backend (Kotlin/Ktor) 和 frontend (Vue 3) 的构建、测试、运行、打包命令
# 修改历史:
# 2026-06-16 13:06:04 nmb - 初始版本 (backend/frontend 目标)
# 2026-06-16 13:06:04 nmb - 追加打包区块 (icon/package-deb/rpm/appimage/package), 方案 B

# ==================== 目录与端口配置 ====================
BACKEND_DIR  := backend
FRONTEND_DIR := frontend
PACKAGING_DIR := packaging

# 后端运行参数（与 AppConfig.kt / application.conf 对齐，可用环境变量覆盖）
LEGADO_PORT  ?= 1122
LEGADO_HOST  ?= 0.0.0.0
DATA_DIR     ?= $(HOME)/.legado

# 构建产物路径
BACKEND_JAR  := $(BACKEND_DIR)/build/libs/legado-linux-1.0.0-all.jar

# 后端静态资源目录（前端构建产物需复制到此处，后端才能托管 SPA）
STATIC_DIR   := $(BACKEND_DIR)/src/main/resources/static

# ==================== 打包相关配置 ====================
# 应用元数据 (与 build.gradle.kts version 对齐)
APP_NAME     := legado-linux
APP_VERSION  := 1.0.0
APP_MAINT    := nmb

# 打包资源与产物路径
APP_ICON_SRC := $(PACKAGING_DIR)/legado-linux.svg
APP_ICON_PNG := $(PACKAGING_DIR)/legado-linux.png
APP_LAUNCHER := $(PACKAGING_DIR)/legado-linux.sh
APP_DESKTOP  := $(PACKAGING_DIR)/legado-linux.desktop
APPDIST_DIR  := $(PACKAGING_DIR)/dist
APPDIR_ROOT  := $(PACKAGING_DIR)/AppDir

# ==================== 默认目标 ====================
.DEFAULT_GOAL := help

.PHONY: help
help: ## 显示所有可用目标
	@echo "Legado Linux Makefile - 可用目标:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "提示: 端口/主机可通过环境变量覆盖，例如: make run-jar LEGADO_PORT=8080"

# ==================== 后端目标 (Backend / Kotlin / Ktor) ====================
.PHONY: backend-run backend-jar backend-test backend-build backend-clean
backend-run: ## 启动后端开发服务器 (端口 1122, host 0.0.0.0)
	cd $(BACKEND_DIR) && ./gradlew run

backend-jar: ## 构建后端 fat-jar (shadowJar -> legado-linux-1.0.0-all.jar)
	cd $(BACKEND_DIR) && ./gradlew shadowJar

backend-test: ## 运行后端全部测试 (Ktor test-host 可用)
	cd $(BACKEND_DIR) && ./gradlew test

backend-build: ## 完整构建后端 (编译 + 测试 + 打包)
	cd $(BACKEND_DIR) && ./gradlew build

backend-clean: ## 清理后端构建产物 (gradle clean)
	cd $(BACKEND_DIR) && ./gradlew clean

# ==================== 前端目标 (Frontend / Vue 3 / Vite) ====================
.PHONY: frontend-install frontend-dev frontend-build frontend-typecheck frontend-lint frontend-format
frontend-install: ## 安装前端依赖 (pnpm install)
	cd $(FRONTEND_DIR) && pnpm install

frontend-dev: ## 启动前端开发服务器 (端口 8080, 代理到后端)
	cd $(FRONTEND_DIR) && pnpm dev

frontend-build: ## 构建前端生产包 (type-check + vite build)
	cd $(FRONTEND_DIR) && pnpm build

frontend-typecheck: ## 前端类型检查 (vue-tsc)
	cd $(FRONTEND_DIR) && pnpm type-check

frontend-lint: ## 前端代码检查并自动修复 (eslint --fix)
	cd $(FRONTEND_DIR) && pnpm lint:fix

frontend-format: ## 前端代码格式化 (prettier --write src/)
	cd $(FRONTEND_DIR) && pnpm format

# ==================== 组合目标 ====================
.PHONY: sync-frontend build run run-jar dev
sync-frontend: frontend-build ## 将前端构建产物同步到后端静态资源目录 (供后端托管 SPA)
	@echo "==> 同步前端构建产物到 $(STATIC_DIR)/"
	@rm -rf $(STATIC_DIR)
	@mkdir -p $(STATIC_DIR)
	@cp -r $(FRONTEND_DIR)/dist/. $(STATIC_DIR)/
	@echo "    前端产物已同步"

build: sync-frontend backend-build ## 完整构建 (前端构建+同步, 后端编译+测试+打包)
	@echo "==> 完整构建完成: $(BACKEND_JAR)"

run: backend-run ## 启动开发环境 (仅后端; 前端请另开终端执行 make frontend-dev)

run-jar: ## 以生产模式运行已构建的 fat-jar (需先 make build)
	@test -f $(BACKEND_JAR) || { echo "✗ 未找到 jar: $(BACKEND_JAR)，请先执行 make build"; exit 1; }
	java -Dlegado.port=$(LEGADO_PORT) -Dlegado.host=$(LEGADO_HOST) -Dlegado.dataDir=$(DATA_DIR) -jar $(BACKEND_JAR)

dev: ## 同时启动前后端开发服务器 (后台启动前端, 前台运行后端)
	@echo "==> 后台启动前端开发服务器 (端口 8080)"
	@cd $(FRONTEND_DIR) && pnpm dev &
	@echo "==> 前台启动后端开发服务器 (端口 $(LEGADO_PORT))"
	@cd $(BACKEND_DIR) && ./gradlew run

# ==================== 打包目标 (Package / deb / rpm / AppImage) ====================
.PHONY: icon package package-deb package-rpm package-appimage

icon: $(APP_ICON_PNG) ## 生成 512x512 PNG 图标 (自动探测转换工具)

# 图标转换: 依次探测 rsvg-convert / convert / inkscape, 三者皆无则报错
$(APP_ICON_PNG): $(APP_ICON_SRC)
	@echo "==> 生成 PNG 图标 (512x512)"
	@if command -v rsvg-convert >/dev/null 2>&1; then \
		rsvg-convert -w 512 -h 512 $< -o $@; \
	elif command -v convert >/dev/null 2>&1; then \
		convert -background none -resize 512x512 $< $@; \
	elif command -v inkscape >/dev/null 2>&1; then \
		inkscape -w 512 -h 512 $< -o $@ >/dev/null 2>&1; \
	else \
		echo "✗ 未找到图标转换工具, 请安装 librsvg2-bin / imagemagick / inkscape 之一"; exit 1; \
	fi
	@echo "    图标已生成: $@"

package-deb: backend-jar icon ## 构建 .deb 安装包 (Debian/Ubuntu/Deepin)
	@echo "==> 构建 .deb 包"
	@command -v jpackage >/dev/null 2>&1 || { echo "✗ 未找到 jpackage, 需 JDK 21+"; exit 1; }
	@command -v dpkg-deb >/dev/null 2>&1 || { echo "✗ 未找到 dpkg-deb, 请安装 dpkg-dev"; exit 1; }
	@mkdir -p $(APPDIST_DIR)
	jpackage \
		--type deb \
		--name $(APP_NAME) \
		--app-version $(APP_VERSION) \
		--vendor "$(APP_MAINT)" \
		--input $(BACKEND_DIR)/build/libs \
		--main-jar legado-linux-1.0.0-all.jar \
		--main-class io.legado.ApplicationKt \
		--icon $(APP_ICON_PNG) \
		--linux-menu-group "Office;Literature;Network" \
		--linux-shortcut \
		--dest $(APPDIST_DIR) \
		--java-options "-Dlegado.port=1122 -Dlegado.host=127.0.0.1"
	@echo "==> .deb 构建完成: $(APPDIST_DIR)"

package-rpm: backend-jar icon ## 构建 .rpm 安装包 (Fedora/RHEL/openSUSE)
	@echo "==> 构建 .rpm 包"
	@command -v jpackage >/dev/null 2>&1 || { echo "✗ 未找到 jpackage, 需 JDK 21+"; exit 1; }
	@command -v rpmbuild >/dev/null 2>&1 || { echo "✗ 未找到 rpmbuild, 请安装 rpm-build"; exit 1; }
	@mkdir -p $(APPDIST_DIR)
	jpackage \
		--type rpm \
		--name $(APP_NAME) \
		--app-version $(APP_VERSION) \
		--vendor "$(APP_MAINT)" \
		--input $(BACKEND_DIR)/build/libs \
		--main-jar legado-linux-1.0.0-all.jar \
		--main-class io.legado.ApplicationKt \
		--icon $(APP_ICON_PNG) \
		--linux-menu-group "Office;Literature;Network" \
		--linux-shortcut \
		--dest $(APPDIST_DIR) \
		--java-options "-Dlegado.port=1122 -Dlegado.host=127.0.0.1"
	@echo "==> .rpm 构建完成: $(APPDIST_DIR)"

package-appimage: backend-jar icon ## 构建 .AppImage 单文件 (所有发行版, 需 appimagetool)
	@echo "==> 构建 .AppImage 包"
	@command -v appimagetool >/dev/null 2>&1 || { echo "✗ 未找到 appimagetool, 请见 packaging/README.md 安装"; exit 1; }
	@echo "    组装 AppDir"
	@rm -rf $(APPDIR_ROOT)
	@mkdir -p $(APPDIR_ROOT)/usr/lib/legado-linux
	@mkdir -p $(APPDIR_ROOT)/usr/share/applications
	@mkdir -p $(APPDIR_ROOT)/usr/share/icons/hicolor/512x512/apps
	# 拷贝 fat-jar、启动器、桌面入口、图标
	@cp $(BACKEND_JAR) $(APPDIR_ROOT)/usr/lib/legado-linux/
	@cp $(APP_LAUNCHER) $(APPDIR_ROOT)/AppRun
	@chmod +x $(APPDIR_ROOT)/AppRun
	@cp $(APP_DESKTOP) $(APPDIR_ROOT)/usr/share/applications/$(APP_NAME).desktop
	@cp $(APP_DESKTOP) $(APPDIR_ROOT)/$(APP_NAME).desktop
	@cp $(APP_ICON_PNG) $(APPDIR_ROOT)/usr/share/icons/hicolor/512x512/apps/$(APP_NAME).png
	@cp $(APP_ICON_PNG) $(APPDIR_ROOT)/$(APP_NAME).png
	@mkdir -p $(APPDIST_DIR)
	APP_NAME=$(APP_NAME) APP_VERSION=$(APP_VERSION) appimagetool \
		$(APPDIR_ROOT) $(APPDIST_DIR)/$(APP_NAME)-$(APP_VERSION)-x86_64.AppImage
	@echo "==> .AppImage 构建完成: $(APPDIST_DIR)/$(APP_NAME)-$(APP_VERSION)-x86_64.AppImage"

package: ## 自动检测工具链, 构建所有可用格式 (缺失工具则跳过)
	@echo "==> 自动检测工具链并构建所有可用格式"
	@COUNT=0; \
	if command -v jpackage >/dev/null 2>&1 && command -v dpkg-deb >/dev/null 2>&1; then \
		$(MAKE) package-deb; COUNT=$$((COUNT+1)); \
	else echo "  跳过 deb (缺 jpackage 或 dpkg-deb)"; fi; \
	if command -v jpackage >/dev/null 2>&1 && command -v rpmbuild >/dev/null 2>&1; then \
		$(MAKE) package-rpm; COUNT=$$((COUNT+1)); \
	else echo "  跳过 rpm (缺 jpackage 或 rpmbuild)"; fi; \
	if command -v appimagetool >/dev/null 2>&1; then \
		$(MAKE) package-appimage; COUNT=$$((COUNT+1)); \
	else echo "  跳过 appimage (缺 appimagetool)"; fi; \
	if [ $$COUNT -eq 0 ]; then \
		echo "✗ 未检测到任何打包工具链, 请见 packaging/README.md 安装依赖"; exit 1; \
	else echo "==> 共构建 $$COUNT 种格式, 产物位于 $(APPDIST_DIR)/"; fi

# ==================== 全局目标 ====================
.PHONY: clean all test
clean: backend-clean ## 清理所有构建产物 (前后端 + 打包)
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(STATIC_DIR)
	@rm -rf $(APPDIST_DIR) $(APPDIR_ROOT) $(APP_ICON_PNG)
	@echo "==> 已清理构建产物 (含 packaging/dist、AppDir、生成图标)"

test: backend-test ## 运行测试 (当前: 后端测试)

all: build ## 完整构建 (等同于 make build)
