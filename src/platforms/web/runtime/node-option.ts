import VNode from '../../../core/vdom/vnode';
/**
 * 创建文本节点
 * @param text
 * @returns
 */
export function createTextNode(text: string): Text {
  return document.createTextNode(text)
}
/**
 * 创建注释节点
 * @param text
 * @returns
 */
export function createComment(text: string): Comment {
  return document.createComment(text)
}

/**
 * 根据tagName和vnode创建 元素并返回
 */
export function createElement(tagName: string, vnode:VNode): Element {
  const elm = document.createElement(tagName)
  if(tagName !== 'select') {
    return elm
  }
  // 如果是多选框的情况
  if (
    vnode.data &&
    vnode.data.attrs &&
    vnode.data.attrs.multiple !== undefined
  ) {
    elm.setAttribute('multiple','multiple')
  }
  return elm
}
/**
 * 返回 dom节点的父节点
 */
export function parentNode(node: Node){
  return node.parentNode
}

/**
 *
 * @param parentNode
 * @param newNode
 * @param referenceNode 参照节点，既要插到这个节点的前面
 */
export function insertBefore(
  parentNode: Node,
  newNode: Node,
  referenceNode: Node
) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild(node: Node, child: Node) {
  node.removeChild(child)
}

export function appendChild(node: Node, child: Node) {
  node.appendChild(child)
}
/**
 * 获取传入节点的下一个兄弟节点
 * @param node
 * @returns
 */
export function nextSibling(node: Node) {
  return node.nextSibling
}
/**
 * 获取传入的dom元素的tag标签
 * @param node
 * @returns
 */
export function tagName(node: Element): string {
  return node.tagName
}

/**
 * 设置dom节点的对于其他节点类型，注意：
 * 1.textContent 将所有子节点的 textContent 合并后返回，除了注释和 processing instructions。
 * （如果该节点没有子节点的话，返回一个空字符串。）
 * 2.在节点上设置 textContent 属性的话，会删除它的所有子节点，并替换为一个具有给定值的文本节点
 * @param node
 * @param text
 */
export function setTextContent(node: Node, text: string) {
  node.textContent = text
}

// export function setStyleScope(node: Element, scopeId: string) {
//   node.setAttribute(scopeId, '')
// }

