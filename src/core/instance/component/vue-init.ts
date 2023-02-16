
import { Component } from "../../../types/component";
import { initEvents } from "../events";
import { initInjections, initProvide } from "../inject";
import { initLifecycle, callHook } from "../lifecycle";
import { initRender } from "../render";
import { initState } from "../state";

let uid = 0

/**
 * InitMixinVue 是进行了初始化工作的到的类 (对应源码中initMixin(Vue)后得到的Vue构造)
 */
export default class InitMixinVue {
  protected _uid;
  protected _self;
  protected _isVue;
  constructor(private options) {
    this._init(options)
  }

  // 这个方法对应Vue源码的_init()方法，源码中是通过initMixin()函数给Vue的原型绑上该方法的
  /**
   * 初始化方法
   * @param options // Vue传入的配置选项
   */
  private _init(options : Record<string,any>) {
    const vm  = this as unknown as Component
    vm._uid = uid++
    // expose real self
    vm._self = vm
    // 为true表示这是个vue实例
    vm._isVue = true

    // 初始化
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    // 调用钩子，此时执行生命周期的 beforeCreate
    callHook(vm , 'beforeCreate');
    // 初始化
    initInjections(vm)
    initState(vm)
    initProvide(vm)
    // 调用钩子，此时执行生命周期的 created
    callHook(vm , 'created')
  }
}
