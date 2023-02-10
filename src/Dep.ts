import Watcher from './Watcher';
/*
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-09 14:29:51
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-09 22:21:21
 * @FilePath: \vue\vue2\src\Dep.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
export default class Dep {
  private subs: Array<Watcher>
  constructor() {
    this.subs = []
  }
  addSub(sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub)
  }

  depend() {
    if(window.target) {
      this.addSub(window.target)
    }
  }

  notify() {
    const subs = this.subs.slice()
    subs.forEach((item) => {
      item.update()
    })
  }
}

function remove(arry:Array<Watcher>, item: Watcher): Array<Watcher> | undefined {
  if(Array.isArray(arry) && arry.length) {
    const index = arry.indexOf(item)
    if(index > -1) {
      return arry.splice(index, 1);
    }
  }
}