import Watcher from './watcher';

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
    // subs.forEach((item) => {
    //   item.update()
    // })
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
