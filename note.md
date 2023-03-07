<!--
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-10 19:10:17
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-11 14:17:00
 * @FilePath: \vue2\note.md
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
**遇到的问题**

1. ts中window报错，找不到的问题：修改tsconfig.ts 将配置项lib加上个dom，如："lib": ["es6", "dom"]
2. ts中window指定义类型报错，如：
   1. 关于ts的一个知识：
      ts的类型定义有两种模式，module模式和script模式。只要文件中出现了import或者export，那么就是module模式，否则就是script模式。
      module模式的特定就是必须明确的import到相应的文件中才能使用该类型定义。
      而script模式则是自动全局生效的(如：Vue源码中的__DEV__)
   2. 现在，希望能直接使用window.target但是会报错，咋办呢？
   解决方案：进行下声明:
   ```ts
    declare global {
      interface Window { target: any; }
    }
   ```
   但是会报：全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中，既declare global {} 必须在module模式上，可以：
   ```ts
    export {}
    declare global {
      interface Window { target: any; }
    }
   ```
   上面我名命为global.d.ts文件，然后放在types文件夹下。这个好像不需要引入，因为已经包含在tsconfig.json的include里面。因此会被扫描到????
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

1. 如果想指定一个元素类型任意的数字作为类型，那么应该：
   ```ts
  let arry: any[]
  // 或者
  let arry: Array<any>
   ```
   而不是
   ```ts
  let arry: [] // 这个等价于let array:Array<any> 既一个永远为空的空数组
   ```

1. 复制一个数组的常用方法：const subs = this.subs.slice()
2. 遇到错误：
  warning: LF will be replaced by CRLF in package.json.
  The file will have its original line endings in your working directory.
  原因：windows中的换行符为 CRLF，而在Linux下的换行符为LF，所以在执行git add . 时，会出现warning。
  解决方法：
    1. 在工程目录下添加 .gitattributes 文件，文件内容为:
        package.json text eol=lf
        package-lock.json text eol=lf
        
    2. git config core.autocrlf false  //禁用自动转换 

1. 关于mocha测试框架以及chai作为断言库测试ts的问题：
   1. 用命令行：对应的命令是：npx mocha --require ts-node/register .\src\tests\Observer.spec.ts。注意，--require ts-node/register 一定要写在前面
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

2. 一个问题：在测试文件中，使用了describe函数,但是这个函数没有引入，哪咋来的呢？我们执行这个文件并不是用node，而是用mocha，因此可以在执行的时候加入的把。因此我们只需要下载describe的ts类型声明就好了。
3. 如果某些文件/目录在.gitignore里面写了，但是没有被git忽略，此时该文件/目录可能已经被git追踪了（被add了），要取消追踪，命令如下：
   1.  git rm --cached readme1.txt 删除readme1.txt的跟踪，并保留在本地
   2.  git rm -r --cached dir1  删除dir1目录，并保留在本地
   3.  git rm --f readme1.txt 删除readme1.txt的跟踪，并且删除本地文件
4.   在post-commit上挂载standard version命令时要注意，因为standard version在更新后会发出一条git提交，会再次触发post-commit钩子，因此在判断下才执行。现在的判断逻辑是通过git log --pretty=format:"%s" -1，获取最近一次提交的头部（-1 是最近一次），判断前面字符是不是"chore(release):"，若是则跳过
5.   注意shell脚本里面的字符， ''是全引用，""则不是
6.   VSCode的ESLint插件默认只读取当前项目根目录下的.eslintignore文件，不在根目录下的无效
7.   在ts中，对于某个没有定义类型的对象，希望用中括号传入字符访问对应属性时会报错，因为希望传入number？方法就是给那个对象定义上类型，如：
    ```ts
      type arrayPrototypeType = Record<string,any>

      const arrayPrototype:arrayPrototypeType = Array.prototype

      const key: string = 'push'

      const arrayValue1 = arrayPrototype[key]
    ```
    或者
    ```ts
      const arrayPrototype = Array.prototype

      const key: string = 'push'

      const arrayValue1 = (arrayPrototype as Record<string, any>)[key]
8.   在ts的数组/对象中，直接访问__proto__是会报错的，提示不存在这个属性，一般的做法是把其断言成any，如：
    ```ts
      (value as any).__proto__ = arrayMethods
    ```
9.   git将当前分支上修改的东西转移到新建分支的方法：
    1.  我们不需要在A分支做commit,只需要在A分支新建B分支，然后切换过去，此时修改的东西就到了B分支，这个时候在B分支commit，那么这些修改保留在B分支上，再切换到A分支上会发现修改都没有保留下来
    2.  使用git stash 将A分支暂存起来，然后在某一个分支（如master分支）新建一个分支B，然后在B分支上使用git stash pop 将修改弹出到B分支上，然后这些修改就在B分支上了
10. 可以里js-dom模拟非浏览器下的dom，js-dom和mocha整合用[jsdom-global](https://www.coder.work/article/103442)
11. vscode调试的launch.json的配置:[文档](https://code.visualstudio.com/Docs/editor/debugging)
12. 在ts中，有的时候 某个变量不能断言成某个类，可以先断言成unknow在断言成目标类型，如： vm as unknown as Component
13. ts导出重载函数的方法
    ```ts
      export function del<T>(array: T[], key: number): void
      export function del(object: object, key: string | number): void
      export function del(target: any[] | object, key: any) {
        // ...
      }
    ```

14. 关于ts中的is这个谓语动词，它是用来收窄类型，[blog](https://barwe.cc/2022/08/22/ts-is)
    一般情况下，变量的类型在定义时被确定，并且在使用时不会发生变化。
    is使得变量在 js 层面被类型判断后，在 ts 层面同步更新其类型信息
    我的理解：
    ```ts
      export function isUndef(v: any): v is undefined | null {
        return v === undefined || v === null
      }
      // is 代表一个boolen类型的返回值，如果是函数的返回值是true，既：v是undefined | null ，反之则不是
    ```

15. ts中生命函数的类型时，如果要使用泛型，记得要在前面加个<T>，如：
    ```ts
      class  Component {
        $set: <T>(
          target: Array<T> | Record<string,any>,
          key: number|string,
          value: T) => T
      }
    ```
16. 关于 NonNullable :
    ``` txt
    type NonNullable<T> = T & {}
    Exclude null and undefined from T
    ```
    用法：
    ```ts
      export function isDef<T>(v: T): v is NonNullable<T> {
        return v !== undefined && v !== null;
      }
    ```

17. 捣鼓了下git cz的原理：
    1.  原理：它并不是设置了git的自定义命令，在.gitconfig下没用发现对应的[alias]设置。应该是利用了：[Git遵循命名约定git-<subcmd>自动解析PATH中可执行文件中的子命令。 这些子命令可以用git <subcmd>执行](https://www.javacodegeeks.com/2018/04/custom-git-subcommands.html)。具体的做法看作者的[回答](https://github.com/commitizen/cz-cli/issues/166)。
    2.  实践：希望能够做一个git stash 快速生成save信息的类似git cz的命令，git st：
        1. 实践过程： 首先在任一位置，这里在项目的bin目录下，新建文件 git-st 和 git-st.cmd文件，然后在package.json中的bin字段上添上
            "git-st":"./bin/git-st" 字段，然后执行npm link命令进行连接，最后按作者的思路书写
            git-st文件：
            ```shell
              #!/usr/bin/env node
              require('./git-st.js');
            ```
            git-st.cmd文件：
            ```shell
              @node "%~dpn0" %*
            ```
            最后，在git-st.js文件中写上希望的代码就OK了
        2. 上面实践的原理解析：
           1. 关于npm 的全局安装：npm的全局安装其实是找到对应包进行下载，然后检测下载的包中的package.json文件下的bin字段，将里面的内容进行链接，以上面的
              "git-st":"./bin/git-st" 为例，首先它会在 某个目录(可以用npm config get prefix查看)中创建一个软链，它的名字就是git-st(既：bin下属性的key)，然后它指向./bin/git-st指向的可执行文件。而上面的目录会被设置在环境变量的Path中。因此我们在终端中直接输入git-st就能运行那个可执行文件了
           2. 关于npm link，文档的描述为：
              ```text
                First, npm link in a package folder with no arguments will create a symlink in the global folder {prefix}/lib/node_modules/<package> that links to the package where the npm link command was executed. It will also link any bins in the package to {prefix}/bin/{name}. Note that npm link uses the global prefix (see npm prefix -g for its value).
              ```
              因此它会像全局安装一样，直接找当前项目的package.json下的bin字段，像全局安装那样设置symlink（这也是网上很多blog说用npm link模拟全局安装的由来）
           3. 由此，上面实践后，在终端输入git st，git会寻找git-st可执行文件，刚好PATH中有(因为npm link过了)，因此会找到./bin/git-st指向的指向文件，然后执行。
           4. 可以使用inquirer去实现命令行的问答交互

18. 设置chrome调试的时候，如果希望能打断点(自己写的ts文件在webpack的HTML插件注入后能有断点追踪)注意：
    1. launch.js的"webRoot": "${workspaceRoot}", 必须这样，别搞其他的。不然断点会失效（不知道为什么，只是VSCode的debug doctor提示的）。
    2. webpack.config.json记得设置devtool: 'inline-source-map'
19. 分支规范，应该参考：https://www.jianshu.com/p/7ae40a051cb8
20. 关于vue源码的__DEV__，它应该是rollup构建的时候替换的，因此，这里打算用webpack的[DefinePlugin](https://webpack.docschina.org/plugins/define-plugin#root)去替换
21. 关于typeof 内容1，它用于获取 内容1 的类型，注意： typeof 某个类 ，那么 会获得这个类的构造函数的类型？可以看看:[博客](https://blog.csdn.net/qq_48896417/article/details/125270242)
22. 关于TS里面的!,如果它放在变量的后面，则：使null和undefined类型可以赋值给其他类型并通过编译，表示该变量值可空。如：
    ```js
      vm._events[event!]
      // 变量event的类型是 string | undefined，因为有undefined，是不能直接放到 中括号里面的，但是加了!就可以
    ```
23. 学习下Vue写模块的东西：
    1.  将模块内部一些配置变量export，让外界去修改，进而改变函数的表现 或者 是读取读取，进而了解函数执行的某些信息，如：export let isUsingMicroTask = false
    但是应该尽量是简单类型

24. 看看tsconfig.js里面path
25. 留一下Vue里面的cache函数，蛮有意思的：
    ```ts
      /**
       * Create a cached version of a pure function.
      * //TODO 这个函数很有意思，它实现了函数结果的缓存。
      * 将某个函数传入cached中，然后返回增强后的还函数，可以这么理解，对于增强后的函数，可以像之前的函数那样使用，只是内部多了缓存
      * 当第二次传入相同的参数时，能直接返回结果
      *
      */
      export function cached<R>(fn: (str: string) => R): (sr: string) => R {
        const cache: Record<string, R> = Object.create(null)
        return function cachedFn(str: string) {
          // 寻找缓存
          const hit = cache[str]
          // 如果缓存名中，直接返回值，否则调用函数并记录结构
          return hit || (cache[str] = fn(str))
        }
      }
    ```
26. 留意下Vue里面的两种for循环
    ```ts
      let arr:[]
      for(let i=0; i<arr.length; i++){}
      // 和
      for(let i=0, l=arr.length; i<l; i++){}
    ```
    上面两种循环是有不同含意的：
    1.第一种是在执行for的过程中arr的长度可能变化，因此没有将arr.length存储起来
    2.第二种是在执行for的过程中arr的长度不会变化，存储arr.length，不用每次都读取一次，进行一点点的性能优化
