**遇到的问题**

1. ts中window报错，找不到的问题：修改tsconfig.ts 将配置项lib加上个dom，如："lib": ["es6", "dom"]
2. ts中window指定义类型报错，如：
   1. 解决方案：进行下声明:
   ```ts
    declare global {
      interface Window { target: any; }
    }
   ```
   最好将上面的声明放到个声明文件中，然后引入，因为没有要导出的东西，global是不需要导出去被使用的。
   但是如果声明文件单单向上面这么写是会报错的，因为ts不认为这是模块，要在前面加个export {}，如：
   ```ts
    export {}
    declare global {
      interface Window { target: any; }
    }
   ```
   上面我名命为global.d.ts文件，然后放在types文件夹下。这个好像不需要引入，因为已经包含在tsconfig.json的include里面。因此会被扫描到
   但是，我后面用其他的集成的时候，好像没有，必须要手动引入。声明文件的引入和其他的不一样，格式是
   ```ts
    /// <reference path = "./types/global.d.ts" /> 
   ```

3. 有
   ```ts
  const obj: object = {}
  const key: string = 'key'
  obj[key] // 这里会报错：元素隐式具有 "any" 类型，因为类型为 "string" 的表达式不能用于索引类型 "{}"。在类型 "{}" 上找不到具有类型为 "string" 的参数的索引签名。ts(7053)
   ```
   此时应该用Record，变成：
   ```ts
  const obj: Record<string, any> = {}
  const key: string = 'key'
  obj[key]
   ```

4. 如果想指定一个元素类型任意的数字作为类型，那么应该：
   ```ts
  let arry: any[]
  // 或者
  let arry: Array<any>
   ```
   而不是
   ```ts
  let arry: [] // 这个等价于let array:Array<any> 既一个永远为空的空数组
   ```

5. 复制一个数组的常用方法：const subs = this.subs.slice()
6. 遇到错误：
  warning: LF will be replaced by CRLF in package.json.
  The file will have its original line endings in your working directory.
  原因：windows中的换行符为 CRLF，而在Linux下的换行符为LF，所以在执行git add . 时，会出现warning。
  解决方法：
    1. 在工程目录下添加 .gitattributes 文件，文件内容为:
        package.json text eol=lf
        package-lock.json text eol=lf
        
    2. git config core.autocrlf false  //禁用自动转换 

7. 关于mocha测试框架以及chai作为断言库测试ts的问题：
   1. 用命令行：对应的命令是：npx mocha --require ts-node/register .\src\tests\Observice.spec.ts。注意，--require ts-node/register 一定要写在前面
   2. mocha支持用package.json去集成配置，如：
      ```json
      {
          "mocha": {
            "colors": true,
            "recursive": [
              "src/**/*.spec.ts"
            ],
            "reporter": [
              "mochawesome" // 这是指定报告格式，要下载mochawesome包。会生成报告单，如html格式，然后任选
            ],
            "require": [ // 必须
              "ts-node/register"
            ]
          }
      }
      ```
      此时可以直接用npx mocha进行测试了。但是每次都报找不到文件，其他配置都OK，因此脚本那写成："test": "mocha ./src/tests/*.spec.ts"

8. 一个问题：在测试文件中，使用了describe函数,但是这个函数没有引入，哪咋来的呢？我们执行这个文件并不是用node，而是用mocha，因此可以在执行的时候加入的把。因此我们只需要下载describe的ts类型声明就好了。
9. 如果某些文件/目录在.gitignore里面写了，但是没有被git忽略，此时该文件/目录可能已经被git追踪了（被add了），要取消追踪，命令如下：
   1.  git rm --cached readme1.txt 删除readme1.txt的跟踪，并保留在本地
   2.  git rm -r --cached dir1  删除dir1目录，并保留在本地
   3.  git rm --f readme1.txt 删除readme1.txt的跟踪，并且删除本地文件