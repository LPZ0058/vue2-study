/* globals MutationObserver */

import { noop } from "src/shared/util"
import { isIE, isIOS, isNative } from "./env"
import { handleError } from "./error"
// 是否使用微队列，按下面的逻辑，这个属性其实是只读的
export let isUsingMicroTask = false
// 回调函数列表，每次调用nextTick设置的回调都会push进这里。而放到微/宏队列的是flushCallbacks
const callbacks: Array<Function> = []
// flushCallbacks 是否在宏/微队列中
let pending = false
//清空callbacks里面的函数
function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// timerFunc的作用是将flushCallbacks放入微/宏队列中，其实这和2.5的实现已经有所不同，原因看源码的注释
//这里是timerFunc根据当前环境 决定放入什么队列中，已经如何放入
let timerFunc


/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) { // 如果支持Promise，则首选Promise放入微队列中
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {// 其次，如果支持MutationObserver则通过MutationObserver将回调放入微队列中
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) { // 在其次，通过setImmediate放入宏队列中
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else { // 最后，通过setImmediate放入宏队列中
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(): Promise<void>
export function nextTick<T>(this: T, cb: (this: T, ...args: any[]) => any): void
export function nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  // 之所以有这个是为了:2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise,promise会在nextTick执行到的时候转成resolve
  let _resolve
  // 把设置的回调函数 / 将返回的promise转成resolved状态的函数放入callbacks中
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
