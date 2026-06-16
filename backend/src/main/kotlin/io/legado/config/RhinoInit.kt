/**
 * Rhino JS 引擎初始化 - 全局 ContextFactory 配置
 *
 * 在 Application 启动时调用，确保 Rhino 运行环境正确配置。
 * 直接使用 org.mozilla:rhino:1.7.15 原生 API，不依赖 com.script 兼容层。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 20:19 nmb - 初始版本，ContextFactory.initGlobal 配置
 */
package io.legado.config

import org.mozilla.javascript.Context
import org.mozilla.javascript.ContextFactory
import org.slf4j.LoggerFactory

object RhinoInit {
    private val logger = LoggerFactory.getLogger(RhinoInit::class.java)

    @Volatile
    private var initialized: Boolean = false

    /**
     * 初始化 Rhino 全局环境。
     * 幂等操作，多次调用仅首次生效。
     */
    fun initialize() {
        if (initialized) {
            logger.debug("Rhino already initialized")
            return
        }

        try {
            ContextFactory.initGlobal(object : ContextFactory() {
                override fun makeContext(): Context {
                    val cx = super.makeContext()
                    // ES6 语法支持（模板字符串、箭头函数等书源常用语法）
                    cx.languageVersion = Context.VERSION_ES6
                    // 使用解释模式（兼容性更好，书源JS通常不复杂）
                    cx.optimizationLevel = -1
                    // 指令计数阈值，防止死循环（约100万条指令后中断）
                    cx.instructionObserverThreshold = 10000
                    // 最大解释器栈深度
                    cx.maximumInterpreterStackDepth = 1024
                    return cx
                }

                override fun observeInstructionCount(cx: Context, instructionCount: Int) {
                    // 超过阈值时抛出错误，防止JS死循环拖垮服务
                    if (instructionCount > 1000000) {
                        throw RuntimeException("JS执行超过指令限制，已中断")
                    }
                }
            })
            initialized = true
            logger.info("Rhino JS engine initialized successfully (VERSION_ES6)")
        } catch (e: Exception) {
            logger.error("Rhino initialization failed: {}", e.localizedMessage, e)
        }
    }
}