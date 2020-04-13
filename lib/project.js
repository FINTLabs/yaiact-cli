const path = require('path');
const fs = require('fs-extra');
const npm = require('npm-programmatic');
const ora = require('ora');
const YAML = require('yaml');
const NodeGit = require('nodegit');
const gitconfig = require('gitconfig');
const chalk = require('chalk');


const spinner = ora('Setting up your project').start();


const projectDirectory = (name) => {
    return path.join(process.cwd(), name);
}

const initializeGitRepository = (name) => {
    const pathToRepo = path.resolve(projectDirectory(name));
    let repository;
    let index;
    let gitConfig;

    fs.ensureDir(path.resolve(__dirname, projectDirectory(name)))
        .then(function () {
            spinner.text = 'Setting up git repository'
            return NodeGit.Repository.init(pathToRepo, 0);
        })
        .then(function (repo) {
            repository = repo;
        })
        .then(function () {
            return repository.refreshIndex();
        })
        .then(function (idx) {
            index = idx;
        })
        .then(function () {
            return index.addAll();
        })
        .then(function () {
            index.entries().forEach(function (entry) {
                spinner.text = 'Adding ' + entry.path;
            });
        })
        .then(() => {
            return gitconfig.get({
                location: 'global'
            });
        })
        .then((config) => {
            gitConfig = config;
        })
        .then(function () {
            return index.write();
        })
        .then(function () {
            return index.writeTree();
        })
        .then(function (oid) {
            var author = NodeGit.Signature.now(gitConfig.user.name,
                gitConfig.user.email);

            return repository.createCommit("HEAD", author, author, "Initialize project using YAIACT", oid, []);
        })
        .then(function (commitId) {
            spinner.text = 'Created initial commit'
            //return new Promise(() => {});
        });


}

const createProjectDirectory = (name) => {
    fs.mkdirpSync(projectDirectory(name));
}

const createGithubActionsFile = (name) => {
    fs.mkdirpSync(path.join(projectDirectory(name), '.github', 'workflows'));

    fs.writeFileSync(path.join(projectDirectory(name), '.github', 'workflows', 'main.yaml'), YAML.stringify({
        name: `Build and deploy ${name.toUpperCase()}`,
        on: {
            push: {
                branches: ['master']
            },
            pull_request: {
                branches: ['master']
            }
        },
        jobs: {
            deploy: {
                'runs-on': 'ubuntu-latest',
                steps: [{
                        uses: 'actions/checkout@v2'
                    },
                    {
                        uses: 'azure/login@v1',
                        with: {
                            creds: '${{ secrets.AZURE_CREDENTIALS }}'
                        }
                    }
                ]
            }
        }
    }));
}

const createPackageJson = (name) => {
    spinner.text = 'Adding dependecies'

    fs.writeFileSync(path.join(projectDirectory(name), 'package.json'), JSON.stringify({
            name: name,
            version: '1.0.0',
        },
        null,
        4
    ));

    return npm.install(['ajv'], {
        cwd: projectDirectory(name),
        save: true
    });
}

const createGitIgorneFile = (name) => {
    spinner.text = 'Adding .gitignore file';

    fs.writeFileSync(path.join(projectDirectory(name), '.gitignore'), [
        'node_modules',
        'output',
        'npm-debug.log',
        '.env',
        '.DS_Store'
    ].join('\n'));
}

const createReadmeFile = (name) => {
    spinner.text = 'Adding README.md file';

    fs.writeFileSync(path.join(projectDirectory(name), 'README.md'), [
        `# ${name.toUpperCase()} - Infractructure as Code`,
        'YAIACT - Yet another Infrastructure as Code Tool'
    ].join('\n'));
}

const init = (name) => {
    if (!fs.existsSync(projectDirectory(name))) {
        createProjectDirectory(name);
        spinner.text = 'Adding Github actions';
        createGithubActionsFile(name);
        createGitIgorneFile(name);
        createReadmeFile(name)
        createPackageJson(name)
            .then(() => initializeGitRepository(name))
            .then(() => spinner.succeed('Your project is finished. Happy coding :)'));
    } else {
        spinner.fail(`The directory ${chalk.bold(name)} already exists`);
    }

}

module.exports = {
    init
}