/*
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-09 14:36:01
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-10 13:12:34
 * @FilePath: \vue\vue2\src\Watcher.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
/// <reference path = "./types/global.d.ts" /> 
import parsePath from './utils/parsePath';
// import './types/global.d.ts';

export default class Watcher {
  // vm应该是vue实例对象
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

  }
  get() {
    window.target = this
    let value = this.getter?.call(this.vm, this.vm)
    window.target = undefined
    return value
  }

  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}