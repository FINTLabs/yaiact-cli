const subs = require('./subscription');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const {
    exec
} = require('child_process');
const utils = require('./utils');

const updateVariables = () => {
    subs.getSubscriptions().forEach((subscription) => {
        console.log(chalk.blue('Subscription (' + subscription + ')'));
        subs.getResourceGroups(subscription).forEach((resourceGroup) => {
            console.log(chalk.blue('  Resource group (' + resourceGroup + ')'))

            subs.getResources(subscription, resourceGroup)
                .then(resources => {
                    const variablesObject = subs.getVariables(subscription, resourceGroup);
                    const json = JSON.stringify(resources);
                    const variables = json.match(/(?<=variables\(\')(.*?)(?=\'\))/g) || [];
                    variables.forEach(variable => {
                        if (variablesObject.hasOwnProperty(variable)) {
                            console.log('    ✅ ', variable);
                        } else {
                            console.log('    ❌ ', variable);
                            variablesObject[variable] = '';
                        }
                    });
                    writeVariablesFile(subscription, resourceGroup, variablesObject);
                })
                .catch(error => console.log(chalk.red(error)));
        });
    });
}


const validateArmTemplate = (armFile, subscription, rg) => {
    const command = `az group deployment validate \
                        --template-file ${armFile} \
                        --resource-group ${rg} \
                        --subscription ${subscription}`;
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(chalk.red('    Template is not valid: '), stderr);
            return;
        }

        const result = JSON.parse(stdout);
        if (result.error === null) {
            console.log(chalk.bold.green('\t✔️ '), 'Template is valid');
        } else {
            console.log(chalk.red('    Template is not valid: ', result));
        }
    });

}

const generateArm = (outputDirectoryName) => {
    const validationPossible = utils.checkAzureCli();
    if (!validationPossible) {
        console.log(chalk.bgRed(chalk.bold('Azure CLI not found.\n'), 'We\'re unable to validate templates!\n',
            'Please install Azure CLI to be able to validate the templates.\n',
            'See https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest for more information.\n'));
    }
    const outputPath = path.join(process.cwd(), outputDirectoryName);
    if (!fs.existsSync(outputDirectoryName)) {
        fs.mkdirSync(outputPath);
    }
    subs.getSubscriptions().forEach((subscription) => {
        console.log(chalk.blue('Subscription (' + subscription + ')'));
        subs.getResourceGroups(subscription).forEach((rg) => {
            console.log(chalk.bold.green('  ✔️ '), 'Generating deployment for ', chalk.bold.yellow(rg))
            const template = require('../templates/arm.template.json')

            template.parameters = subs.getParameters(subscription, rg);
            template.variables = subs.getVariables(subscription, rg);


            const rgPath = path.join(outputPath, subscription, rg);

            fs.mkdirpSync(rgPath);
            subs.getResources(subscription, rg)
                .then((resources) => {
                    template.resources = resources;
                    const armFile = `${rgPath}/azuredeploy.json`;
                    fs.writeFileSync(armFile, JSON.stringify(template, null, 4));
                    validationPossible && validateArmTemplate(armFile, subscription, rg);
                });
        });
    });
}

const writeVariablesFile = (subscription, resourceGroup, object) => {
    resourceGroupPath = path.join(process.cwd(), 'data', subscription, resourceGroup);
    fs.writeFileSync(path.join(resourceGroupPath, 'variables.json'), JSON.stringify(object, null, 4));
}

const writeParamterssFile = (subscription, resourceGroup, object) => {
    resourceGroupPath = path.join(process.cwd(), 'data', subscription, resourceGroup);
    fs.writeFileSync(path.join(resourceGroupPath, 'parameters.json'), JSON.stringify(object, null, 4));
}

const createResourceGroupSkeleton = (subscription, name) => {
    resourceGroupPath = path.join(process.cwd(), 'data', subscription, name);
    fs.mkdirpSync(resourceGroupPath);
    writeVariablesFile(subscription, name, {});
    writeParamterssFile(subscription, name, {});
    fs.writeFileSync(path.join(resourceGroupPath, 'outputs.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(resourceGroupPath, 'functions.json'), JSON.stringify({}));

    console.log(chalk.green('  ✔️ '), `Skeleton for ${name} (${subscription}) created!\n`);
}

module.exports = {
    generateArm,
    createResourceGroupSkeleton,
    updateVariables
}