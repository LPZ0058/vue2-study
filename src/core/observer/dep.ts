import Watcher from './watcher';

let uid = 0;

export default class Dep {
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
