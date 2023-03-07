import Watcher from "./watcher"
import config from '../config'
import { warn, nextTick, inBrowser, isIE } from '../util/index'
import { Component } from "types/component"


// 保存当前更新循环中全部的watcher.id,主要是用来记录状态，既：
// has[id] = undefined 表示watcher没有加入队列
// has[id] = null 表示watcher 正在更新或者已经更新完了（在队列中）
// has[id] = true 表示watcher watcher已经加入了queue，但是没有被更新
let has: { [key: number]: true | undefined | null } = {}
let flushing = false
/**
 * 关于queue，有个点要注意：
 * 1. 就是watcher的id。因为watcher是有依赖的，id大的依赖id小的，按注释：
  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
 * 2. 因此在调用watcher的回调的时候，要保证先调用id小的watcher再调用id大的
 *
 */
const queue: Array<Watcher> = []
let index = 0
// 表示flushSchedulerQueue是否被放入nextTick被排期
let waiting = false
let circular: { [key: number]: number } = {}
const activatedChildren: Array<Component> = []
export const MAX_UPDATE_COUNT = 100

/**
 * flush完了queue的watcher(的回调)时调用的，重置相关的状态标志变量(index, has, waitting, flushing)
 */
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (__DEV__) {
    circular = {}
  }
  waiting = flushing = false
}


// TODO 这个currentFlushTimestamp和核心逻辑无关，暂时不了解其作用，标记下，日后研究---------------------


// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
export let currentFlushTimestamp = 0
// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now


// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now()
  }
}

// ---------------------------------------------------------------------------------------------------
/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow()
  // 开始flush
  flushing = true
  let watcher, id

  // 对queue按watcher的id排序成从小到大的排序，维护依赖关系
  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    // 调用watcher的回调
    watcher.run()
    // in dev build, check and stop circular updates.
    if (__DEV__ && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' +
            (watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // call component updated and activated hooks
  // callActivatedHooks(activatedQueue)
  // callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  // if (devtools && config.devtools) {
  //   devtools.emit('flush')
  // }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  // 这里是 == ，因此当has[id] 为null 或者undefined的时候执行逻辑
  // 既：如果传入的watcher"不在队列"或者"正在更新/已经更新完"，则执行逻辑，在queue的合适位置插入。
  // 如果传入的watcher在队列但是未执行，跳过就可以了呀
  if (has[id] == null) {
    // 将watcher标记为已经入队，但没有更新,下一步就是要将watcher放入queue的合适的位置
    has[id] = true
    // 如果不是在flush的过程中添加的，那么直接放到queue的后面就OK了
    if (!flushing) {
      queue.push(watcher)
      // 如果是在flush过程中被添加的，那么
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      /**
       * 这是个什么意思呢？其实在flush过程中被更新，那么一定是处于flushSchedulerQueue里面的for循环当中
       * index表示当前正在处理的watcher在queue的下标.
       * queue[index]前面的watcher是已经处理过的，他们的id一定小于queue[index]，且has[id]为null
       * queue[index]后面面的watcher是没有处理过的，他们的id一定小于queue[index]，且has[id]为true
       */
      let i = queue.length - 1
      // 从后往前遍历，知道当前watcher的合适的位置插入，考虑到依赖性，其实就是：
      // 未执行的watcher是index后面的watcher，因此只要维护当前watcher对index后面的watcher的依赖性就OK了
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      // 在正确的位置进行插入
      queue.splice(i + 1, 0, watcher)
    }
    // 如果flushSchedulerQueue用nextTick进行排期，那么放入排期
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}


// function callActivatedHooks(queue) {
//   for (let i = 0; i < queue.length; i++) {
//     queue[i]._inactive = true
//     activateChildComponent(queue[i], true /* true */)
//   }
// }

