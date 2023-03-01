import Watcher from '../core/observer/watcher';

export {}
declare global {
  interface Window { target: Watcher | undefined; }
}
