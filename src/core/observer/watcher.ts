

import { isObject, parsePath } from 'core/util/lang';
import { WatcherOptions } from '../../types/observer/watcher';
import Dep, { popTarget, pushTarget } from './dep';
import { traverse } from './traverse';
import { Component } from 'src/types/component';
import { handleError, remove } from 'core/util';
import { queueWatcher } from './scheduler';
import { DepTarget } from './dep';

declare global {
  interface Window { target: Watcher | undefined; }
}

let uid = 0

/**
 * 两个问题：
 *  1. 为什么watch中要记录deps
 *  2.源码为什么有两份deps/newDeps和depIds/newDepIds，感觉是为了更好的整理和dep的关系？
 *    类似新VNode和旧VNode。deps和depIds是当前的真实关系，newDeps和newDepIds是将要变成的关系(通过cleanupDeps)
 */

/**
 * Watcher的作用，监听vm上指定的某属性（已经是响应式的了），以便在其发送改变时，调用回调函数
 */
export default class Watcher implements DepTarget {
  // vm在vue中应该是vue实例对象
  vm: Component
  // 这个expression 是报错的时候日志打印用的，对正常的功能没有影响
  expression: string
  id: number
  /**
   * @description: 解析expOrFn得到的函数，传入一个对象（一般是当前的vue实例），访问并返回该对象在expOrFn指向的属性
   * @return {*}
   */
  getter: ((obj: object) => any) | undefined

  // 该Watcher梆定的回调
  cb: (value, oldValue) => any

  // Watcher监视的属性的值(getter返回)
  value: any
  // 记录当前Watcher被那些Dep收集了
  deps: Dep[]
  newDeps: Dep[]
  // 表示当前回调是不是用户传入的，如果是，那么可能会报错，则需要用try-catch去包裹
  user: boolean
  // 只有computed的watcher的lazy和dirty为true
  // lazy为true，watcher实例化时，不执行get函数
  lazy: boolean
  // dirty是对观察的属性的标记，如果为true，则需要重新获取属性的值，如果为false，则读取缓存的值
  dirty: boolean
  // 是否同步变化，既watcher在接收到更新通知(调用update函数)时不能全都立刻执行callback
  /**
    一般同一事件循环中可能需要改变好几次state状态，但视图view只需要根据最后一次计算结果同步渲染就行（react中的setState就是典型）。如果一直做同步更新无疑是个很大的性能损耗。
    这就要求watcher在接收到更新通知时不能全都立刻执行callback。
   */
  sync: boolean
  // 表示当前watcher是否被销毁(执行了teardown函数)
  active: boolean
  before?: Function
  // 记录收集了当前Watcher的Dep的id(这里用Set主要是为了去重)
  depIds: Set<number|string>
  newDepIds: Set<number|string>
  // 是否深层监视，如果为true，则会让它的子元素也会获取当前的Watcher对象进行个响应
  deep: boolean

  /**
   * @description:
   * @param {*} vm 要监听的响应式对象
   * @param {*} expOrFn 要监视的属性的路径，或者读取要监听内容的函数(想想计算属性)
   * @param {*} cb  对应的回调函数
   * @param {*} options 配置对象{deep:bbolean, }
   * @param {*} isRenderWatcher 是否是渲染用的watcher（既要放在vm._watcher里面的组件级别的渲染watcher）
   * @return {*}
   */
  constructor (vm: Component,
              expOrFn: string | (() => any),
              cb: (value: any, oldValue: any) => any,
              options?:WatcherOptions,
              isRenderWatcher?: boolean
              ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // 处理option
    if(options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else{
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.deps = [];
    this.newDeps = []
    this.depIds = new Set();
    this.newDepIds = new Set()
    this.id = uid ++;
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.getter = typeof expOrFn === 'function' ? expOrFn :  parsePath(expOrFn);
    this.cb = cb;
    // 当是计算属性的watcher的时候，lazy为true，不立即获取值，和对应Dep建立联系
    this.value = this.lazy? undefined: this.get()
    this.expression = process.env.NODE_ENV !== 'production'
    ? expOrFn.toString()
    : ''
  }
  // update(): void {
  //   throw new Error('Method not implemented.');
  // }

  addDep(dep: Dep) { // 同时维护双方的关系
    const id = dep.id;
    if(!this.depIds.has(dep.id)){
      this.depIds.add(id);
      this.deps.push(dep);
      dep.addSub(this)
    }
  }

  /**
   *1.获取Watcher观察的内容的值，同时和对应Dep建立双向联系
   *2.如果设置deep深度观察，那么会将观察对象的全部属性
   * @returns
   */
  get() {
    // 现在Vue的watcher已经不是使用window.target去挂载当前的watcher实例了，
    // 而是将它挂载到Dep类的静态属性上面，既：Dep.target
    // window.target = this
    pushTarget(this)

    let value
    const vm = this.vm
    try {
      // 1.获取Watcher观察的内容的值，同时和对应Dep建立双向联系
      value = this.getter?.call(vm, vm)
    } catch (e) {
      if (this.user) { // 用户创建的getter，出现错误，应该上传给Vue的HandleError
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // 2.如果设置deep深度观察，那么会将观察对象的全部属性
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
    // window.target = undefined
    popTarget()
    this.cleanupDeps()
    // eslint-disable-next-line no-unsafe-finally
    return value
  }
}

  // 通知watcher需要调用回调了
  update() {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) { // 如果是同步
      this.run()
    } else {
      // 将当前watcher放入watcher的调度器中，以便进行异步调度
      /**
       * 简单介绍下这个异步调度：
       * 里面是利用nextTick将存储了watcher的queue的flush函数放入宏/微队列中。queue用于收集flush被排期到
       * 真正执行之间被调度的watcher
       */
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   *
   * run函数就是真正获取新值，然后调用回调的函数
   */
  run () {
    if (this.active) {
      // 获取新值
      const value = this.get()
      // 1.如果是非引用类型，那么只有新值和旧值是不一样的时候才需要调用回调
      // 2.如果是引用类型，那么直接调用回调函数，因为this.value只是对应的首地址，
      //    其里面的内容可能发生了翻天覆地的变化
      // 3.如果设置了deep，那更是要了。// TODO 感觉前两个就可以了呀，难道this.deep为true的时候this.value不是引用类型？
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }


  /**
   * Clean up for dependency collection.
   * 根据现在的dep，整理成newDeps，类似于新VNode和旧VNode的感觉，这个有点patch的感觉
   */
  cleanupDeps () {
    let i = this.deps.length
    // 更新Dep里面收集的watcher
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    // 将dep的内容转成newDep 将depIds转成newDepIds
    let tmp:any = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  // 将watcher从各个dep中清除
  // TODO 问题：那当前对象维护的deps咋办？自己咋办？（因为是双向梆定的，这里只是单向梆定）
  // 答： 由浏览器自动回收就可以了，当自己的引用为0了，被浏览器回收后，对Dep的引用也没了。
  // 注意： Watcher会被应用的地方：1. Dep 2. Vue实例的_watcher,_watchers,_computedWatchers(对象)
  teardown() {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }

  }

  // TODO 这个函数是干嘛的呀？
  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * 获取watcher观察的内容的值(会和Dep建立联系)
   * 这个方法是计算属性特供
   */
    evaluate () {
      this.value = this.get()
      this.dirty = false
    }
}
