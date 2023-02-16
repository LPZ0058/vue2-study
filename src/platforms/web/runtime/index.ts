import { isUnknownElement } from '../utils/element';

/**
 * 这里拓展了Vue对象在浏览器运行时的属性和方法（源码中通过initClobalAPI()
 * 去增强，在global-api.ts中，一开始找半天找不到）
 */
const config = Object.create(null)
config.isUnknownElement = isUnknownElement;

export default class webVue {
  static config = config
}
