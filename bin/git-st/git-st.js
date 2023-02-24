const inquirer = require('inquirer');
require('./utils/index')
const { program } = require('commander');
const child_process= require("child_process");


program.description('stash 当前的代码').action(stachSave)
program.command('select').alias('sel').description('查看并选择stash 代码').action(stashSelect)

program.parse(process.argv)

function execResultToString(result){
  return Buffer.isBuffer(result) ? result.toString() : typeof(result) === 'string' ? result : ''
}

async function stachSave(){
  const reasonAnswer = await inquirer.prompt([{
    type:'input',
    name:'reason',
    message:'请输入stash的原因',
  }])
const {reason} = reasonAnswer
const changeAnswer = await inquirer.prompt([{
  type:'input',
  name:'msg',
  message:'请输入本次stash的所做的主要改动',
}])
const {msg} = changeAnswer
const dateStr = (new Date()).format('yyyy-MM-dd hh:mm:ss')
// const currentBranch = child_process.execSync('git rev-parse --abbrev-ref HEAD')
// const currentBranchStr = Buffer.isBuffer(currentBranch) ? currentBranch.toString() : typeof(currentBranch) === 'string' ? currentBranch : ''

const stashMsg = ` reason: ${reason} | msg: ${msg} | date: ${dateStr}`

const result = child_process.execSync(`git stash save "${stashMsg}"`)
console.log(Buffer.isBuffer(result) ? result.toString() : typeof(result) === 'string' ? result : '')
}


async function stashSelect() {
  const result = child_process.execSync(`git stash list`)
  const listStr = Buffer.isBuffer(result) ? result.toString() : typeof(result) === 'string' ? result : ''
  const list = listStr.split('\n')
  list.pop()
  if(list.length === 0) {
    console.log('stash中空空如也')
    return
  }
  const {selectedStash} = await inquirer.prompt([{
    type:'list',
    name: 'selectedStash',
    message: '请选择要应用的Stash',
    choices: list
  }])
  const {selectedOption} = await inquirer.prompt([{
    type:'list',
    name: 'selectedOption',
    message: `你选择的是${selectedStash},请选择要进行的操作`,
    choices: ['pop','apply']
  }])
  const stashStr = selectedStash.split(':')[0]
  const startIndex = stashStr.indexOf('{') + 1
  const endIndex = stashStr.indexOf('}')
  const index = parseInt(stashStr.substring(startIndex, endIndex))
  switch (selectedOption) {
    case 'pop' :
      try {
        const popResult = child_process.execSync(`git stash pop ${index}`)
        console.log(execResultToString(popResult))
      } catch (error) {
      }
      break
    case 'apply' :
      try {
        const applyResult = child_process.execSync(`git stash apply ${index}`)
        console.log(execResultToString(applyResult))
      } catch (error) {
      }
      break
  }
}

// stachSave()


