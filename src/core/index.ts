import { initGlobalAPI } from "./global-api"
import Vue from "./instance"

// 初始化Vue的全局API
initGlobalAPI(Vue)

// Object.defineProperty(Vue.prototype, '$isServer', {
//   get: isServerRendering
// })

// Object.defineProperty(Vue.prototype, '$ssrContext', {
//   get() {
//     /* istanbul ignore next */
//     return this.$vnode && this.$vnode.ssrContext
//   }
// })

// expose FunctionalRenderContext for ssr runtime helper installation
// Object.defineProperty(Vue, 'FunctionalRenderContext', {
//   value: FunctionalRenderContext
// })
// 这里的__VERSION__ 在编译的时候会被修改，这里用Webpack的DefinePlugin插件
Vue.version = '__VERSION__'

export default Vue
