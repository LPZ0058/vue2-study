
/// <reference path = "../types/global.d.ts" />
import { parsePath } from '../utils/lang';
// import './types/global.d.ts';

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

  /**
   * @description: 该Watcher梆定的回调
   * @return {*}
   */
  cb: (value: any, oldValue: any) => any

  // getter返回的值
  value: any


  /**
   * @description:
   * @param {*} vm 要监听的响应式对象
   * @param {*} expOrFn 要监视的属性的路径
   * @param {*} cb  对应的回调函数
   * @return {*}
   */
  constructor (vm: any, expOrFn: any, cb: (value: any, oldValue: any) => any) {
    this.vm = vm;
    this.getter = parsePath(expOrFn);
    this.cb = cb;
    this.value = this.get();
  }
  get() {
    window.target = this
    const value = this.getter?.call(this.vm, this.vm)
    window.target = undefined
    return value
  }

  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}
