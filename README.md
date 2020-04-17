# YAIACT-CLI - Azure
*Yet another Infrastructure as Code Tool*

The goal for this tool is to be able to simplify and modulaise creation of Azure Resource Management templates (ARMs).

With this to you can create separate ARM json files for each resources in your deployment and the tool will join these
files into on ARM template build time.

# Getting started
## Prerequests
* `az` command line tool must be installed. See https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest for mor information.
* You need to be logged in to the tenants your gone create deployments for.

## Installing `yaiact` globally
`npm install @fintlabs/yaiact-cli@latest -g`
    
## Setting up a new `yaiact` project
`npx @fintlabs/yaiact-cli init my-project-name`

This will setup a `node` project with the necessary dependencies.

## Create a new resource group
### With `yarn`
`yarn new-rg <resource group name> <subscription name> <location>`

### With npm
`npm run new-rg <resource group name> <subscription name> <location>`

### With `yaiact-cli`
`yaiact new rg <resource group name> <subscription name> <location>`

This will create a new folder in the `data` folder. This is where you create your arm snipes. 

## Build the ARM template
### With `yarn`
`yarn build`

### With npm
`npm run build`

### With `yaiact-cli`
`yaiact arm`

This will create the ARM templates for your resource groups in the output directory.

