/*
 * Legado Linux 后端 - Gradle Settings
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

rootProject.name = "legado-linux"

// 插件仓库
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

// 依赖仓库
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}