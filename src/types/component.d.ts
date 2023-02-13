import { $WeatchOptions } from "./component/index"

/**
 * 这里定义Vue完全体的类
 */
export declare class  Component {
  constructor(option: any)

  _uid: number | string
  _self: Component

  // 是否为Vue实例
  _isVue: true

  $watch: (
    expOrFn: string | (() => any),
    callback: Function,
    options?:$WeatchOptions
  ) => Function

  $set: <T>(
    target: Array<T> | Record<string,any>,
    key: number|string,
    value: T) => T

  $delete: <T>(
    target: Array<T> | Record<string, any>,
    key: number | string
  ) => void
}
