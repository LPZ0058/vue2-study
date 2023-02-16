import VNode from "../../../../core/vdom/vnode";
export type createElement = (tagName: string, vnode:VNode) => Element
export type parentNode = (node: Node) => parentNode | null
export type insertBefore = (parentNode: Node,
  newNode: Node,
  referenceNode: Node) => void
export type removeChild = (node: Node, child: Node) => void
export type appendChild = (node: Node, child: Node) => void
export type nextSibling = (node: Node) => Node
export type tagName = (node: Element) => string
export type setTextContent = (node: Node, text: string) => void
export type createComment = (text?: string) => Node
export type createTextNode = (text?: string) => Node
export declare class NodeOps {
  /**
   * 根据tagName和vnode创建 元素并返回
   */
  createElement: createElement
  /**
   * 返回 dom节点的父节点
   */
  createComment: createComment

  createTextNode: createTextNode

  parentNode: parentNode

  insertBefore: insertBefore

  removeChild: removeChild

  appendChild: appendChild

  nextSibling: nextSibling

  tagName: tagName

  setTextContent: setTextContent

}

