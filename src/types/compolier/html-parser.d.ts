import { ASTAttr, CompilerOptions } from "./index"

export interface HTMLParserOptions extends CompilerOptions {
  // parse到开始标签触发函数
  start?:(
    tag: string,
    attrs: ASTAttr[],
    // 是否为自闭合标签
    unary: boolean,
    start: number,
    end: number
  ) => void

  // parse到结束标签触发的函数
  end?: (tag: string, start: number, end: number) => void
  // parse到文本标签触发的函数
  chars?: (text: string, start?: number, end?: number) => void
  // parse到注释标签触发的函数
  comment?: (content: string, start: number, end: number) => void

}
