import { Component } from "../../types/component";
import { toArray } from '../../shared/util';
import { handleError } from "core/util/error";

export function initEvents(vm: Component) {
  // vm._events = Object.create(null)
  // vm._hasHookEvent = false
  // // init parent attached events
  // const listeners = vm.$options._parentListeners
  // if (listeners) {
  //   updateComponentListeners(vm, listeners)
  // }
}


export function eventsMixin(Vue: typeof Component) {
  // console.log('eventsMixin')

  Vue.prototype.$on = function(event, callback) {
    const vm:Component = this
    if(Array.isArray(event)) {
      for(let i=0; i < event.length; i++) {
        vm.$on(event[i], callback)
      }
    } else { // 到这里event一定是字符串
      /**
       * vm._events是维护事件和对应回调的对象，key是事件名，value是对应回调函数的数组
       */
      (vm._events[event] || (vm._events[event] = [])).push(callback)
    }
    return vm
  }

  /**
   * 移除自定义事件监听器，注意：
   *  1. 如果没有提供参数，则移除所有的事件监听器
   *  2. 如果只提供了事件，那么移除该事件的所有监听器
   *  3. 如果同时提供了事件和回调，则只移除这个回调的监听器
   */
  Vue.prototype.$off = function(event?, fn?) {
    const vm:Component = this
    // 1. 如果没有提供参数，则移除所有的事件监听器
    if(!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }

    if(Array.isArray(event)) {
      for(let i=0; i<event.length; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // 到这里events一定是字符串
    // 注意这里的! 表示：用在赋值的内容后时，使null和undefined类型可以赋值给其他类型并通过编译，表示该变量值可空
    const cbs = vm._events[event!]
    if(!cbs) {
      return vm
    }
    // 2. 如果只提供了事件，那么移除该事件的所有监听器
    if(arguments.length === 1) {
      vm._events[event!] = null
      return vm
    }
    // 3.如果同时提供了事件和回调，则只移除这个回调的监听器
    if(fn) {
      const cbs = vm._events[event!]
      let cb;
      let i = cbs.length
      while(i--) {
        cb = cbs[i]
        // 这里 cb.fn === fn 是为了vm.$once准备的
        if(cb === fn || cb.fn === fn) {
          cbs.splice(i,1)
          break
        }
      }
    }
    return vm
  }

  // 监听某个事件一次，触发一次回调后就会把该回调删除
  Vue.prototype.$once = function(event, fn) {
    const vm:Component = this
    function on () {
      vm.$off(event, on)
      // 这里直接手动调用一次
      // eslint-disable-next-line prefer-rest-params
      fn.apply(vm, arguments)
    }
    // 想想前面的$off,这里为什么要这么设计呢？很简单，因为外部传入的
    // 是fn，这里实践上传入的是on。考虑这样一种情况，如果用户在这个事
    // 件第一次回调触发之前调用$off删除这个回调，那么...
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  /**
   * // TODO 看看源码emit函数的，
   * 原本的函数类型定义的是：(event: string, ...args: Array<any>)
   * 这里实现的时候是(event)，后面的参数可以不写，毕竟直接用的argument，不写正常，而且不会报错
   */
  Vue.prototype.$emit = function(event) {
    const vm:Component = this
    const cbs = vm._events[event]
    if(cbs) {
      // eslint-disable-next-line prefer-rest-params
      const args = toArray(arguments, 1)
      for(let i=0; i<= cbs.length; i++) {
        try {
          cbs[i].apply(vm, args)
        } catch (e) {
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return vm
  }

}

