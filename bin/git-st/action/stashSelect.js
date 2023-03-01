const inquirer = require('inquirer');
const { getString } = require('../utils/index')
const child_process= require("child_process");


async function stashSelect() {
  const result = child_process.execSync(`git stash list`)
  const listStr = getString(result)
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
    choices: ['pop','apply','show', 'show -p']
  }])
  const stashStr = selectedStash.split(':')[0]
  const startIndex = stashStr.indexOf('{') + 1
  const endIndex = stashStr.indexOf('}')
  const index = parseInt(stashStr.substring(startIndex, endIndex))

  switch (selectedOption) {
    case 'pop' :
      child_process.spawnSync('git',['stash', 'pop', `${index}`])
      break
    case 'apply' :
      child_process.spawnSync('git',['stash', 'apply', `${index}`])
      break
    case 'show' :
      child_process.spawnSync('git',['stash','show'], {
        stdio: 'inherit'
      })
      break
    case 'show -p':
      console.log('\n')
      child_process.spawnSync('git', ['stash', 'show', '-p'],{
        stdio: 'inherit'
      })
    break
  }
}


module.exports.stashSelect = stashSelect
