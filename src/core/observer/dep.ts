import Watcher from './watcher';

let uid = 0;

export interface DepTarget {
  id: number
  addDep(dep: Dep): void
  update(): void
}

export default class Dep {
  static target?: DepTarget | null
  private subs: Array<Watcher>
  public id: number | string
  constructor() {
    this.subs = []
    this.id = uid++;
  }
  addSub(sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub)
  }

  depend() {
    window.target?.addDep(this)
  }

  notify() {
    const subs = this.subs.slice()
    for(let i=0; i<subs.length; i++) {
      subs[i].update()
    }
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
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack: Array<DepTarget | null | undefined> = []

export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
