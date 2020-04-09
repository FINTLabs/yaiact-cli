#!/usr/bin/env node

const utils = require('./lib/subscription');
const fs = require('fs');
const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Yaiact', {
            horizontalLayout: 'full'
        })
    ),
    '\n'
);

utils.getSubscriptions().forEach((subscription) => {
    console.log(chalk.blue('Subscription (' + subscription + ')'));
    utils.getResourceGroups(subscription).forEach((rg) => {
        console.log(chalk.bold.green('  ✔️'), 'Generating deployment for ' + chalk.bold.yellow(rg))
        const template = require('./templates/arm.template.json')

        template.parameters = utils.getParameters(subscription, rg);
        template.variables = utils.getVariables(subscription, rg);

        utils.getResources(subscription, rg)
            .then((resources) => {
                template.resources = resources;
                if (!fs.existsSync('./output')) {
                    fs.mkdirSync('./output');
                }
                fs.writeFileSync(`./output/${rg}-deploy.json`, JSON.stringify(template, null, 4));

            });
    });
});