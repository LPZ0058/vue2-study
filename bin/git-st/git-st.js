const { program } = require('commander');
const {stachSave, stashSelect} = require('./action')


program.description('stash 当前的代码').action(stachSave)
program.command('select').alias('sel').description('查看并选择stash 代码').action(stashSelect)

program.parse(process.argv)



