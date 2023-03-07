/**
 * 在这里封装和语言相关的一般方法
 */

/**
 * 解析路径字符串，返回函数。该函数接收一个对象，访问该对象路径字符串指定的值并返回。
 * 有Currying函数的味道
 */
// 这个正则表达式是匹配非下划线、数字、字母、.\$的内容（路径字符串中不能出现的东西）。
// 在正则的[]中$就是$, ^是非的意思, . 就是. , \w就是字母，数字，下划线等等
const bailRE = /[^\w.$]/;

export function parsePath(path:string) :((obj: object) => any) | undefined{
  if(bailRE.test(path)) {
    return;
  }
  const segments:string[] = path.split('.');
  return function (obj: Record<string, any>) : any{
    for(let i=0; i < segments.length; i++) {
      if(!obj) return;
      obj = obj[segments[i]]
    }
    return obj;
  }
}

/**
 * 封装定义对象属性的方法
 */
export function def(obj:object, key:string, value: any, enumerable?:boolean) {
  Object.defineProperty(obj,key,{
    writable: true,
    enumerable: !!enumerable, // 如果不传，默认是不可枚举的
    configurable: true,
    value
  })
}

/**
 * 判断是否是对象（除去null的情况）
 */
export function isObject(obj: object): boolean{
  return obj !== null && typeof obj === 'object'
}
/**
 * 判断传入的value是不是函数
 * @param value
 * @returns
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}

/**
 * 判断对象是否有指定的own属性
 */
export function hasOwn(obj:object, key:string):boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * 判读传入的值是否是数组有效的下标(1. 大于等于0 、2. 是个整数 、 3. 是个有限的值)
 * @param val 传入的内容
 * @returns
 */
export function isValidArrayIndex(val: any): boolean {
  const num = Number.parseFloat(val)
  return num >= 0 && num === Math.floor(num) && Number.isFinite(val)
}

/**
 * 判断传入的值是否未定义(undefined或者null)
 * @param v
 * @returns
 */
export function isUndef(v: any): v is undefined | null {
  return v === undefined || v === null
}

/**
 * 判断传入的值是否已经定义(非undefined和null)
 * @param v
 * @returns
 */
export function isDef<T>(v: T): v is NonNullable<T> {
  return v !== undefined && v !== null;
}

/**
 * 判断窜入的是否是数组
 */
export const isArray = Array.isArray

export function isTrue(v: any): boolean {
  return v === true
}

export function isFalse(v: any): boolean {
  return v === false
}
/**
 * 判断传入的是否是原始类型(不包括undefined和null)
 * @param v
 * @returns
 */
export function isPrimitive(v: any): boolean {
  return (typeof v === 'string' || typeof v === 'number' || typeof v === 'symbol' || typeof v === 'boolean')
}

/**
 * 根据 字符串(元素1,元素2,..,元素n) 转成map(元素1: true, 元素2: true) 最后返回一个函数，这个函数传入 key，如果map有这个key则返回true，否则返回undefined
 *
 * @param str 字符串(key1,key1,..,keyn)
 * @param expectsLowerCase 是否期待key转成小写
 * @returns 一个函数，这个函数传入 key，如果str有这个key则返回true，否则返回undefined
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean): (key: string) => true | undefined {
    // 这里map的类型用Record<string, boolean>生命不好，因为这样后面函数的返回值就不是true | undefined了
    const map = Object.create(null)
    const list: Array<string> = str.split(',')

    list.forEach((item, index) => {
      map[item] = true
    })

    return expectsLowerCase ? key => map[key.toLowerCase()] : key => map[key]
}



/**
 * 能够被用于html的tag,属性等的合法的字符(大小写字母以及一些合法的unicode字符)
 */
export const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/


/**
 *
 */
