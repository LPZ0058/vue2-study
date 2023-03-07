import config from "src/core/config";
import { warn } from "./debug";
import { inBrowser } from "./env";

/**
 *  这是Vue处理错误的函数，看看文档的描述：
 *
    错误传播规则

    默认情况下，如果全局的 config.errorHandler 被定义，所有的错误仍会发送它，因此这些错误仍然会向单一的分析服务的地方进行汇报。

    如果一个组件的 inheritance chain (继承链)或 parent chain (父链)中存在多个 errorCaptured 钩子，则它们将会被相同的错误逐个唤起。

    如果此 errorCaptured 钩子自身抛出了一个错误，则这个新错误和原本被捕获的错误都会发送给全局的 config.errorHandler。

    一个 errorCaptured 钩子能够返回 false 以阻止错误继续向上传播。本质上是说“这个错误已经被搞定了且应该被忽略”。它会阻止其它任何会被这个错误唤起的 errorCaptured 钩子和全局的 config.errorHandler。

此时不难理解下面的函数
* @param err
 * @param vm
 * @param info
 * @returns
 */
export function handleError (err, vm, info) {
  // TODO 下面这里待研究
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  // pushTarget();
  try {
    if (vm) {
      let cur = vm;
      while ((cur = cur.$parent)) {
        const hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
              const capture = hooks[i].call(cur, err, vm, info) === false;
              // 返回false直接退出，就没有向上传播
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    // popTarget();
  }
}
// 调用全局的config.errorHandler处理错误
function globalHandleError(err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e: any) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler')
      }
    }
  }
  logError(err, vm, info)
}

// 用于打印错误的函数
function logError(err, vm, info) {
  if (__DEV__) {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if (inBrowser && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target = null
// const targetStack: Array<DepTarget | null | undefined> = []

// export function pushTarget(target?: DepTarget | null) {
//   targetStack.push(target)
//   Dep.target = target
// }

// export function popTarget() {
//   targetStack.pop()
//   Dep.target = targetStack[targetStack.length - 1]
// }
