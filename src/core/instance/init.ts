import { Component } from "src/types/component";
import { initEvents } from "./events";
import { initInjections, initProvide } from "./inject";
import { callHook, initLifecycle } from "./lifecycle";
import { initRender } from "./render";
import { initState } from "./state";

let uid = 0
/**
 * 注意：
 * // TODO typeof Component 得到的是Component的构造函数的类型
 * @param Vue
 */
export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options?: Record<string, any>) {
    const vm: Component = this

    // 设置当前的_uid
    vm._uid = uid++
    // 通过_isVue属性标记这是个Vue的实例,这样就不需要靠instanceof去判断了
    // 这个在后面的 响应式中会遇到，如果observe的时候发现传入的对象有这个属性，那么直接退出
    vm._isVue = true



    // TODO vm._scope 的具体作用和实现不是很了解,按某篇博客的说法：
    /**
     * effectScope 是 Vue 3.2.0 引入的新 API，属于响应式系统的高阶内容。从字面上理解，它就是 effect 作用域，
     * 用于收集在其中所创建的副作用，并能对其进行统一的处理。
     * 博客地址：https://blog.csdn.net/gtLBTNq9mr3/article/details/127483696
     *
     * 看了 vue2.6 里面是没用这个的，按vue2.6的来
     */
    // effect scope
    // vm._scope = new EffectScope(true /* detached */)
    // vm._scope._vm = true


    // expose real self
    vm._self = vm
    // 生命周期
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')


  }
}

