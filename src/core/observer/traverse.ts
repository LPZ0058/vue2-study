import { isObject } from '../../utils/lang';
import Observer from './index';
import Dep from './dep';

/**
 * 这个是收集要响应的dep的集合，用Set是为了去重，主要是为了保障对于同一引用类型，
 * 只会被Watcher收集一次（其实是保障一个Dep只会收集一次同一个Watcher）
 */
const seenObject = new Set<string | number>()

export function traverse(val: object) {
  _traverse(val,seenObject)
  seenObject.clear()
}


function _traverse(val, seen: Set<string | number>) {
  let i, keys: string[];
  const isArray = Array.isArray(val)
  // 如果传入的val既不是对象/数组 或者 被冻结了，那么没必要检测其子元素，直接退出
  if((!isArray && !isObject(val)) || (Object.isFrozen(val))) {
    return
  }

  if(val.__ob__) {
    const depId = (val.__ob__ as Observer).dep.id;
    if (seen.has(depId)) { // 如果当前对象以及被_traverse过了，那么这层递归就可以结束了
      return;
    }
    seen.add(depId)
  }
  // 对于数组/对象，的每一个属性都读取一遍，让他们可以收集当前的watcher
  if(isArray) {
    i = val.length
    while(i--) _traverse(val[i], seenObject) // 这里的val[i]和下面的val[keys[i]]读取了属性，会让对于的Dep收集到watcher
  } else {
    keys  = Object.keys(val)
    i = keys.length
    while(i--) _traverse(val[keys[i]], seenObject)
  }
}
