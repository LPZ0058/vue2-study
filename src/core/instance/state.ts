import { $WeatchOptions } from "../../types/component/index";
import { Component } from "../../types/component";
import Watcher from "../observer/watcher";
import { set, del } from '../observer/index';
import { isServerRendering, noop, warn } from "core/util";
import Dep from "core/observer/dep";

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function initState(vm: Component) {
  // const opts = vm.$options
  // if (opts.props) initProps(vm, opts.props)

  // // Composition API
  // initSetup(vm)

  // if (opts.methods) initMethods(vm, opts.methods)
  // if (opts.data) {
  //   initData(vm)
  // } else {
  //   const ob = observe((vm._data = {}))
  //   ob && ob.vmCount++
  // }
  // if (opts.computed) initComputed(vm, opts.computed)
  // if (opts.watch && opts.watch !== nativeWatch) {
  //   initWatch(vm, opts.watch)
  // }
}

const computedWatcherOptions = { lazy: true }
function initComputed (vm: Component, computed: Object) {
  // _computedWatchers用于收集计算属性的watcher，这是个对象，键是计算属性名，值是对应的watcher
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  /**
   * 看看计算属性的用法，以便快速了解后面的源码
      computed: {
        fullName1: function () {
          return this.firstName + ' ' + this.lastName
        },
        fullName2: {
          // getter
          get: function () {
            return this.firstName + ' ' + this.lastName
          },
          // setter
          set: function (newValue) {
            var names = newValue.split(' ')
            this.firstName = names[0]
            this.lastName = names[names.length - 1]
          }
        }
      }
   */
  for (const key in computed) {
    // userDef 可能是对象，也可能是函数
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        // vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // 计算属性的watcher的回调函数是个空函数...和我之前想的不一样
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`)
      }
    }
  }
}
export function defineComputed (
  target: any,
  key: string,
  userDef: Record<string, any> | Function
) {
  const shouldCache = !isServerRendering()
  // 根据环境sharedPropertyDefinition
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}


function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

export function stateMixin(Vue: typeof Component) {
  // console.log('这是stateMixin')

  /**
   * 就是熟悉的vm.$watch()
   * @param expOrFn
   * @param callback
   * @param options
   * @returns
   */
  Vue.prototype.$watch = function(
    expOrFn:string | (() => any),
    callback: any,
    options?: $WeatchOptions
    ): Function {
    const vm = this
    const watcher = new Watcher(this, expOrFn, callback);
    if(options && options.immediate) callback.call(vm,watcher.value)
    return watcher.teardown
  }
  // 熟悉的vm.$set()
  Vue.prototype.$set = set
  // 熟悉的vm.$delete()
  Vue.prototype.$delete = del

}

