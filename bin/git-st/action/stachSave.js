const inquirer = require('inquirer');
const { getString } = require('../utils/index')
const child_process= require("child_process");

async function stachSave(){
  const result = getString(child_process.execSync(`git status -s`))
  if(result === '') {
    child_process.spawnSync('git',['stash'], {
      stdio:"inherit"
    })
    return
  }
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

  const stashMsg = ` reason: ${reason} | msg: ${msg} | date: ${dateStr}`
  const commondStr = `git stash save "${stashMsg}"`

  console.log("\n",'###--------------------------------------------------------###')
  console.log(commondStr)
  console.log('###--------------------------------------------------------###',"\n")

  const confirmAnswer = await inquirer.prompt([{
    type:'confirm',
    name:'confirm',
    message:'确认使用以上信息提交？',
  }])
  const {confirm} = confirmAnswer
  if(confirm) {
    child_process.spawnSync('git',['stash', 'save', `"${stashMsg}"`],{
      stdio:"inherit"
    })
  }
}

module.exports.stachSave = stachSave
