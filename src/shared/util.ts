// 这是个空函数，一般用于给那些需要根据环境动态赋值的函数(没有返回值的函数)赋予默认值
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(a?: any, b?: any, c?: any) {}

// 一个只会返回false的函数,一般用于那些is..., must... 的谓语判断函数的默认值
export const no = (a?: any, b?: any, c?: any) => false
/**
 * Return the same value. 也是用于赋予默认值
 */
export const identity = (_: any) => _

/**
 * 将类数组转成数组
 * @param list 要转成数组的类数组
 * @param start 要转的内容的开始下标
 * @returns
 */
export function toArray(list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * 将item从arr中删除
 * @param arr
 * @param item
 * @returns
 */
export function remove(arr: Array<any>, item: any): Array<any> | void {
  const len = arr.length
  if (len) {
    // fast path for the only / last item
    if (item === arr[len - 1]) {
      arr.length = len - 1
      return
    }
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}


/**
 * Mix _from指定的对象的属性到to上
 * @param to
 * @param _from
 * @returns
 */
export function extend(
  to: Record<PropertyKey, any>,
  _from?: Record<PropertyKey, any>
): Record<PropertyKey, any> {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * Create a cached version of a pure function.
 * //TODO 这个函数很有意思，它实现了函数结果的缓存。
 * 将某个函数传入cached中，然后返回增强后的还函数，可以这么理解，对于增强后的函数，可以像之前的函数那样使用，只是内部多了缓存
 * 当第二次传入相同的参数时，能直接返回结果
 *
 */
export function cached<R>(fn: (str: string) => R): (sr: string) => R {
  const cache: Record<string, R> = Object.create(null)
  return function cachedFn(str: string) {
    // 寻找缓存
    const hit = cache[str]
    // 如果缓存名中，直接返回值，否则调用函数并记录结构
    return hit || (cache[str] = fn(str))
  }
}
