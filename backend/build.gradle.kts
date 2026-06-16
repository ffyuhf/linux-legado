/*
 * Legado Linux 后端 - Gradle 构建配置
 * 创建日期: 2026-06-13
 * 说明: Kotlin/JVM + Ktor + Exposed + SQLite + Rhino
 *
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

plugins {
    kotlin("jvm") version "2.1.21"
    kotlin("plugin.serialization") version "2.1.21"
    // Application 插件：支持 run 任务和 distTar/distZip 打包
    application
    // Shadow 插件：生成 fat-jar（包含所有依赖的可运行 jar）
    id("com.gradleup.shadow") version "8.3.6"
}

group = "io.legado"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // ==================== Ktor 服务端 3.x（兼容 Kotlin 2.1） ====================
    // Netty 引擎：高性能异步HTTP服务器
    implementation("io.ktor:ktor-server-netty:3.1.3")
    // 核心路由、中间件
    implementation("io.ktor:ktor-server-core:3.1.3")
    // CORS 跨域支持（前端开发模式必需）
    implementation("io.ktor:ktor-server-cors:3.1.3")
    // 静态资源托管（Vue SPA 构建产物，包含在 host-common 中）
    implementation("io.ktor:ktor-server-host-common:3.1.3")
    // WebSocket 支持（书籍搜索推送、书源调试）
    implementation("io.ktor:ktor-server-websockets:3.1.3")
    // 请求内容协商（JSON序列化）
    implementation("io.ktor:ktor-server-content-negotiation:3.1.3")
    implementation("io.ktor:ktor-serialization-gson:3.1.3")
    // 状态页面（统一错误处理）
    implementation("io.ktor:ktor-server-status-pages:3.1.3")
    // Call Logging（请求日志）
    implementation("io.ktor:ktor-server-call-logging:3.1.3")
    // 缓存头支持
    implementation("io.ktor:ktor-server-caching-headers:3.1.3")

    // ==================== Ktor 客户端 ====================
    implementation("io.ktor:ktor-client-okhttp:3.1.3")

    // ==================== Exposed ORM ====================
    // JetBrains 官方 Kotlin SQL 框架（替代 Android Room）
    implementation("org.jetbrains.exposed:exposed-core:0.50.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.1")
    // Kotlin DateTime 支持
    implementation("org.jetbrains.exposed:exposed-kotlin-datetime:0.50.1")

    // ==================== SQLite JDBC ====================
    // 嵌入式数据库（单用户桌面场景，无需数据库服务器）
    implementation("org.xerial:sqlite-jdbc:3.46.0.0")

    // ==================== JSON 序列化 ====================
    // Gson：与 Android 版保持 JSON 字段命名完全兼容
    implementation("com.google.code.gson:gson:2.11.0")

    // ==================== JS 引擎 ====================
    // Rhino：执行书源规则中的 JavaScript（替代 Android Rhino）
    implementation("org.mozilla:rhino:1.7.15")

    // ==================== HTML 解析 ====================
    // Jsoup：解析书源规则中的 CSS 选择器
    implementation("org.jsoup:jsoup:1.18.1")
    // JsoupXpath：在 Jsoup 基础上提供 XPath 解析能力
    implementation("cn.wanghaomiao:JsoupXpath:2.5.3")

    // ==================== JSON Path 解析 ====================
    // Jayway JsonPath：执行书源规则中的 $.xx JsonPath 查询
    implementation("com.jayway.jsonpath:json-path:2.10.0")

    // ==================== 文本处理 ====================
    // Apache Commons Text：HTML 实体转义/反转义（StringEscapeUtils）
    implementation("org.apache.commons:commons-text:1.13.1")

    // ==================== HTTP 客户端 ====================
    // OkHttp：书源网络请求（与 Android 版保持一致）
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // ==================== 日志 ====================
    implementation("ch.qos.logback:logback-classic:1.5.6")

    // ==================== Kotlin Coroutines ====================
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")

    // ==================== 测试 ====================
    testImplementation(kotlin("test"))
    testImplementation("io.ktor:ktor-server-test-host:3.1.3")
}

// 对齐 Java 和 Kotlin 的 JVM 目标版本，避免编译不一致错误
java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.add("-Xjvm-default=all")
        freeCompilerArgs.add("-Xwhen-guards")
    }
}

application {
    // Ktor 应用主类
    mainClass.set("io.legado.ApplicationKt")
}

// Shadow jar 配置：合并服务文件
tasks.named<com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar>("shadowJar") {
    mergeServiceFiles()
}

