import { del, observe, set } from "core/observer"
import { GlobalAPI } from "src/types/global-api"
import config from "../config"

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'
import { initUse } from "./use"

/**
 * initGlobalAPI 是设置Vue的静态方法的地方，既Vue的全局API
 * @param Vue
 */
export function initGlobalAPI(Vue: GlobalAPI) {
  // configDef 就是设置 Vue.config的PropertyDescriptor
  const configDef: Record<string, any> = {}
  // 设置getter
  configDef.get = () => config
  if (__DEV__) {
    // 设置setter，通过这个会让外界无法修改暴露出来的Vue.config
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 让一个对象可响应。Vue 内部会用它来处理 data 函数返回的对象。
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  // ASSET_TYPES.forEach(type => {
  //   Vue.options[type + 's'] = Object.create(null)
  // })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // extend(Vue.options.components, builtInComponents)

  // 赋予Vue.use()
  initUse(Vue)
  // initMixin(Vue)
  // initExtend(Vue)
  // initAssetRegisters(Vue)
}
