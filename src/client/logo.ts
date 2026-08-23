/**
 * dsh-jenkins —— 插件 logo。
 *
 * footer 入口按钮图标（Jenkins 官方 SVG logo，assets/logo.svg）由宿主 node 半边
 * 经 HTTP 路由 /plugins/dsh-jenkins/assets/logo.svg 提供：宿主不会把插件包内的
 * assets 文件直接暴露给浏览器，因此 node 半边注册 exact 路由按包内原文件喂给
 * 浏览器（见 src/host/index.ts）。
 */

/** footer 入口按钮图标：Jenkins 官方 SVG（同源绝对路径，由宿主路由提供）。 */
export const JENKINS_LOGO = '/plugins/dsh-jenkins/assets/logo.svg'
