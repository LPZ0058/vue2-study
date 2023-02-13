/*
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-12 12:07:24
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-12 21:13:40
 * @FilePath: \vue2\src\utils\lang.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
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
 * 判断传入的值是否为空(undefined或者null)
 * @param v
 * @returns
 */
export function isUndef(v: any): v is undefined | null {
  return v === undefined || v === null
}
