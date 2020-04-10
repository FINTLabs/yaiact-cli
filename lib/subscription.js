const fs = require('fs');
const path = require('path');
const recursive = require('recursive-readdir');
const replace = require('replace-in-file');


const getSubscriptions = () => {
    return fs.readdirSync(path.join(process.cwd(), 'data'));
}

const getResourceGroupPath = (subscription, resourceGroup) => {
    return path.join(process.cwd(), 'data', subscription, resourceGroup);
}

const getResourceGroups = (subscription) => {
    return fs.readdirSync(path.join(process.cwd(), 'data', subscription));
}

const getVariables = (subscription, resourceGroup) => {
    return require(path.join(process.cwd(), 'data', subscription, resourceGroup, 'variables.json'));
}

const getParameters = (subscription, resourceGroup) => {
    return require(path.join(process.cwd(), 'data', subscription, resourceGroup, 'parameters.json'));
}

const getResources = (subscription, resourceGroup) => {
    return recursive(getResourceGroupPath(subscription, resourceGroup), [
            "parameters.json",
            "variables.json",
            "functions.json",
            "outputs.json"
        ])
        .then((files) => {
            let resources = [];
            files.forEach((file) => {
                const resource = require(file);
                resources = [...resources, ...replaceThisWithName(resource, getName(file))];
            });
            return resources;
        })
        .catch(error => console.log(error));
}
const getName = (filePath) => {
    return path.basename(filePath).replace('.json', '');
}

const replaceThisWithName = (resource, name) => {
    return JSON.parse(JSON.stringify(resource).replace(/\$this/g, name));
}

module.exports = {
    getSubscriptions,
    getResourceGroups,
    getVariables,
    getParameters,
    getResources
}