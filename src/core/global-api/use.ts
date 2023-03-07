import type { GlobalAPI } from 'types/global-api'
import { toArray, isFunction } from '../util/index'

export function initUse(Vue: GlobalAPI) {
  /**
   * 文档介绍：
   *
   * 安装 Vue.js 插件。如果插件是一个对象，必须提供 install 方法。如果插件是一个函数，
   * 它会被作为 install 方法。install 方法调用时，会将 Vue 作为参数传入。
   * 该方法需要在调用 new Vue() 之前被调用。
   * 当 install 方法被同一个插件多次调用，插件将只会被安装一次。
   * @param plugin
   * @returns
   */
  Vue.use = function (plugin: Function | any) {
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = [])
      // 如果plugin已经use过了，则直接返回
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 去掉第一个参数(plugin)
    // eslint-disable-next-line prefer-rest-params
    const args = toArray(arguments, 1)
    // 将Vue作为args的第一个元素
    args.unshift(this)
    if (isFunction(plugin.install)) {
      // 调用plugin的install方法，并且把this指向plugin，同时传入args，其第一个元素是Vue
      // eslint-disable-next-line prefer-spread
      plugin.install.apply(plugin, args)
    } else if (isFunction(plugin)) { // 如果plugin是函数，则直接调用
      // eslint-disable-next-line prefer-spread
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
