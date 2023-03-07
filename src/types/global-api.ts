import { Config } from "src/core/config"
import { Component } from "./component"

export interface  GlobalAPI {
  // TODO 下面这个语法不是很懂，先标记下
  (options?: any): void
  cid: number
  options: Record<string, any>
  config: Config
  util: Object
  extend: (options: typeof Component | object) => typeof Component
  set: <T>(target: Object | Array<T>, key: string | number, value: T) => T
  delete: <T>(target: Object | Array<T>, key: string | number) => void
  nextTick: (fn: Function, context?: Object) => void | Promise<any>
  use: (plugin: Function | Object) => GlobalAPI
  mixin: (mixin: Object) => GlobalAPI
  compile: (template: string) => {
    render: Function
    staticRenderFns: Array<Function>
  }
  observable: <T>(value: T) => T
  // allow dynamic method registration
  [key: string]: any
}
