
/// <reference path = "../../types/global.d.ts" />
import { WatcherConstractorOptions } from '../../types/observer/watcher';
import { parsePath } from '../../utils/lang';
import Dep from './dep';
import { traverse } from './traverse';

/**
 * Watcher的作用，监听vm上指定的某属性（已经是响应式的了），以便在其发送改变时，调用回调函数
 */
export default class Watcher {
  // vm在vue中应该是vue实例对象
  vm: object

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
  // 记录收集了当前Watcher的Dep的id(这里用Set主要是为了去重)
  depIds: Set<number|string>
  // 是否深层监视，如果为true，则会让它的子元素也会获取当前的Watcher对象进行个响应
  deep: boolean

  /**
   * @description:
   * @param {*} vm 要监听的响应式对象
   * @param {*} expOrFn 要监视的属性的路径，或者读取要监听内容的函数(想想计算属性)
   * @param {*} cb  对应的回调函数
   * @param {*} option 配置对象{deep:bbolean, }
   * @return {*}
   */
  constructor (vm: any, expOrFn: string | (() => any), cb: (value: any, oldValue: any) => any, option?:WatcherConstractorOptions) {
    this.vm = vm;
    this.getter = typeof expOrFn === 'function' ? expOrFn :  parsePath(expOrFn);
    this.cb = cb;
    this.value = this.get();
    this.deps = [];
    this.depIds = new Set();
    if(option) {
      this.deep = !!option.deep
    } else{
      this.deep = false
    }
  }

  addDep(dep: Dep) { // 同时维护双方的关系
    const id = dep.id;
    if(!this.depIds.has(dep.id)){
      this.depIds.add(id);
      this.deps.push(dep);
      dep.addSub(this)
    }
  }

  get() {
    window.target = this
    const value = this.getter?.call(this.vm, this.vm)
    if(this.deep) {
      traverse(value)
    }
    window.target = undefined
    return value
  }
  // 调用watcher的回调
  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
  // 将watcher从各个dep中清除
  // TODO 问题：那当前对象维护的deps咋办？自己咋办？，我看vue上面还有一段复杂的逻辑，研究下
  teardown() {
    let i = this.deps.length
    while(i--) {
      this.deps[i].removeSub(this)
    }
  }
}
