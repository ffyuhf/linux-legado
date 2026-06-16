/**
 * 设置页面路由
 * 创建日期: 2026-06-14 | 修改历史: 2026-06-14 12:40 nmb - 初始版本
 */
export const settingsRoutes = [
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/Settings.vue'),
    },
];
