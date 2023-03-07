// TODO 留意下Vu源码中warn的写法
// import { __DEV__ } from "../global";
import { noop } from "../../shared/util";


/**
 * 它直接导出变量并声明类型，同时给一个空函数 noop 作为默认值，然后在后面的判断
 * 语句中给warn赋值。
 */
export let warn: (msg: string, vm?: Comment | null) => void = noop

console.log('__DEV__:' + __DEV__)
if(__DEV__) {
  warn = (msg) => {
    console.error(`[Vue warn]: ${msg}`)
  }
}
