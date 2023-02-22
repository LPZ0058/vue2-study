// console.log('hi world')
const inquirer = require('inquirer');
require('./utils/index')
const child_process= require("child_process")

async function main(){
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

main()


