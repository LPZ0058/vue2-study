import Watcher from "core/observer/watcher"
import { warn } from "core/util"
import { noop, remove } from "src/shared/util"
import { WatcherOptions } from "types/observer/watcher"
import { Component } from "../../types/component"

export function callHook(vm: Component, hook: string,  args?: any[], setContext = true) {
  console.log('这是callHook方法')
}

export function lifecycleMixin(Vue: typeof Component) {
  /**
   * 强制刷新，之前就调用_watcher对应的watcher的update，生成新的vdom对比然后改变dom
   */
  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }

  Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // 删除自己和父级元素之间的联系
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }

    // 删除当前对象创建的watcher
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }

    // TODO 这里以后看看
    // remove reference from data ob
    // frozen object may not have observer.
    // if (vm._data.__ob__) {
    //   vm._data.__ob__.vmCount--
    // }

    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    // vm.__patch__(vm._vnode, null)
    // 进入destroyed生命周期，以便调用对应的钩子
    callHook(vm, 'destroyed')
    // 删除当前vm实例上的全部事件监听
    vm.$off()
    // remove __vue__ reference
3
    // // release circular reference (#6759)
    // if (vm.$vnode) {
    //   vm.$vnode.parent = null
    // }
  }


}


export function initLifecycle(vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  // let parent = options.parent
  // if (parent && !options.abstract) {
  //   while (parent.$options.abstract && parent.$parent) {
  //     parent = parent.$parent
  //   }
  //   parent.$children.push(vm)
  // }

  // vm.$parent = parent
  // vm.$root = parent ? parent.$root : vm

  // vm.$children = []
  // vm.$refs = {}

  // vm._provided = parent ? parent._provided : Object.create(null)
  // vm._watcher = null
  // vm._inactive = null
  // vm._directInactive = false
  // vm._isMounted = false
  // vm._isDestroyed = false
  // vm._isBeingDestroyed = false
}


export function mountComponent(
  vm: Component,
  el: Element | null | undefined,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 首先判断 render 渲染函数，没有则将 render 属性配置为一个创建空节点的函数
  if (!vm.$options.render) {
    // @ts-expect-error invalid type
    vm.$options.render = createEmptyVNode
  }
  // 触发beforeMount的钩子
  callHook(vm, 'beforeMount')

  // 定义更新组件的函数，其实就是_watcher的回调
  const updateComponent = () => {
    // 调用vm._render()生成虚拟节点，传给_update()
    vm._update(vm._render(), hydrating)
  }

  // 设置vm._watcher的配置选项
  const watcherOptions: WatcherOptions = {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }


  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(
    vm,
    updateComponent,
    noop,
    watcherOptions,
    true /* isRenderWatcher */
  )
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  // TODO 这段不是很懂，这个vm.$vnode是什么时候用的？
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
