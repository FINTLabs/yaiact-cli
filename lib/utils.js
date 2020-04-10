const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const commandExistsSync = require('command-exists').sync;




const cleanBuildDirectory = (buildDirectory) => {
    fs.remove(path.join(process.cwd(), buildDirectory));
    console.log(chalk.green('Cleaned build directory\n'));
}

const checkAzureCli = () => {
    return commandExistsSync('az');
}

module.exports = {
    cleanBuildDirectory,
    checkAzureCli
}