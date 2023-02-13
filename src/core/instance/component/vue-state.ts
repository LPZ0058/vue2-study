import { Component } from '../../../types/component';
import InitMixinVue from './vue-init';
import Watcher from '../../../core/observer/watcher';
import { isValidArrayIndex, hasOwn } from '../../../utils/lang';
import { defineReactive } from '../../../core/observer/index';
import Observer from '../../../core/observer/index';
import { $WeatchOptions } from '../../../types/component/index';
/**
 * StateMixinVue 是初始化完状态后得到的类
 */
export default class StateMixinVue extends InitMixinVue {
  constructor(options: Record<string, any>) {
    super(options);
  }

  /**
   * 就是熟悉的vm.$watch()
   * @param expOrFn
   * @param callback
   * @param options
   * @returns
   */
  $watch(
    expOrFn:string | (() => any),
    callback: (newVal, oldVal?) => any,
    options: $WeatchOptions
    ): Function {
    const vm = this
    const watcher = new Watcher(this, expOrFn, callback);
    if(options.immediate) callback.call(vm,watcher.value)
    return watcher.teardown
  }

  /**
   * 这个方法就是给对象/数组设置属性的方法，就是熟悉的vm.$set
   * 注意，传入的target对象可能是非响应式的
   * @param target
   * @param key
   * @param value
   */
  $set<T>(target: T[], key: number, value: T): T
  $set<T>(target: object, key: string | number, value: T): T
  $set(target, key, value) {
    const isArray = Array.isArray(target)

    if(isArray) {// 如果target是数组
      if(isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key)
        // 这里数组的splice方法以及被覆盖了，因此直接调用就可以了（1. 触发Dep的watcher 2. 将value设置成响应的）
        target.splice(key, 1, value)
        return value
      }
    } else {
      // 如果target是对象
      // 1. 如果key已经存在了,直接赋值就可以了，因为此时该属性已经设置了setter
      if(key in target && !(key in Object.prototype)) {
        target[key] = value
        return value
      }

      // 2. 如果key不存在，既新增一个元素，则用defineReactive设置对应的属性
      const ob = target.__ob__ as Observer
      // 注意对象不能是 Vue 实例，或者 Vue 实例的根数据对象(文档的警告)
      if(target._isVue || (ob && (ob as any).vmCount)) {
        // vue是封装了个warn方法，到时再研究
        process.env.NODE_ENV !== 'production' && console.warn(
          'Avoid adding reactive properties to a Vue instance or its root $data ' +
            'at runtime - declare it upfront in the data option.'
        )

        return value
      }

      if(!ob) { // 没用ob则target不是响应式对象，此时直接赋值就好
        target[key] = value
        return value
      }

      defineReactive((ob as Observer).value, key, value)
      // 直接通知梆定在当前对象上的watcher
      ob.dep.notify()
      return value
    }
  }

  /**
   * 这个方法就是给对象/数组删除属性的方法，就是熟悉的vm.$delete
   * 注意，传入的target对象可能是非响应式的
   * @param target
   * @param key
   */
  $delete<T>(target: T[], key: number): void
  $delete<T>(target: object, key: string | number): void
  $delete(target, key) {
    // 如果是数组
    if(Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key,1)
      return
    }
    // 是对象,则删除属性，然后通知该对象的watcher
    const ob = target.__ob__ as Observer
    // 注意对象不能是 Vue 实例，或者 Vue 实例的根数据对象(文档的警告)
    if(target._isVue || (ob && (ob as any).vmCount)) {
      process.env.NODE_ENV !== 'production' && console.warn(
        `Cannot delete reactive property on undefined, null, or primitive value: ${target}`
      )
      return
    }

    // 如果 key 不是target自身的属性，那什么都不用做
    if(!hasOwn(target, key)) {
      return
    }

    delete target[key]
    if(!ob) { // 不是响应对象则直接返回
      return
    }
    ob.dep.notify()
  }
}
