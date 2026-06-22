import { createWebHashHistory, createRouter } from 'vue-router'
import { bookRoutes } from './bookRouter'
import { sourceRoutes } from './sourceRouter'
import { settingsRoutes } from './settingsRouter'

const router = createRouter({
  //   history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [bookRoutes, sourceRoutes, settingsRoutes].flat(),
})

/** 路由路径与页面标题映射表 */
const titleMap: Record<string, string> = {
  '/': '书架',
  '/bookSource': '书源管理',
  '/rssSource': '订阅源管理',
  '/settings': '应用设置',
  '/chapter': '阅读',
}

/** 路由后置钩子：按路径同步更新页面标题 */
router.afterEach(to => {
  document.title = titleMap[to.path] || '阅读'
})

export default router
