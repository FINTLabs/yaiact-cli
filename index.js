#!/usr/bin/env node

const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const utils = require('./lib/utils');
const arm = require('./lib/arm');
const project = require('./lib/project');
const yargs = require("yargs");



clear();

console.log(
    chalk.yellow(
        figlet.textSync('Yaiact', {
            horizontalLayout: 'full'
        })
    ),
    '\n'
);

yargs.scriptName('yaiact')
    .usage('$0 <cmd> [args]')
    .command('init <name>', 'Create a new project', (yargs) => {
        yargs
            .positional('name', {
                type: 'string',
                require: true,
                describe: 'name of project'
            })
    }, (argv) => {
        project.init(argv.name);
    })
    .command('clean', 'Clean output directory', (yargs) => {
        yargs.options('d', {
            alias: 'directory',
            type: 'string',
            default: 'output',
            describe: 'name of the output directory',
            hidden: true
        })
    }, (argv) => {
        utils.cleanBuildDirectory(argv.d);
    })
    .command('arm', 'Generate ARM template', (yargs) => {
        yargs.options('d', {
            alias: 'directory',
            type: 'string',
            default: 'output',
            describe: 'name of the build directory',
            hidden: true
        })
    }, (argv) => {
        arm.generateArm(argv.d);
        arm.generateDeployScript(argv.d);
    })
    .command('update variables', 'Update variables', (yargs) => {}, (argv) => {
        arm.updateVariables();
    })
    .command('new rg <name> <subscription> <location>', 'Generate skeleton for resource group', (yargs) => {
        yargs
            .positional('name', {
                type: 'string',
                require: true,
                describe: 'name of resource group'
            })
            .positional('subscription', {
                type: 'string',
                require: true,
                describe: 'name of subscription'
            })
            .positional('location', {
                type: 'string',
                require: true,
                describe: 'location'
            })
    }, (argv) => {
        if (!argv.name || !argv.subscription) {
            yargs.showHelp();
            process.exit(0);
        }
        arm.createResourceGroupSkeleton(argv.subscription, argv.name, argv.location);
    })
    .demandCommand(1, 'You need at least one command before moving on!')
    .help()
    .argv;