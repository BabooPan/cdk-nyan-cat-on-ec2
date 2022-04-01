const { awscdk } = require('projen');

const PROJECT_NAME = 'aws-cdk-nyan-cat-on-ec2';
const PROJECT_DESCRIPTION = 'Nyan cat web page hosted on EC2 Instance.';

const project = new awscdk.AwsCdkTypeScriptApp({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  repository: 'https://gitlab.com/ecloudture/security/cspm-infrastructure',
  authorName: 'Baboo Pan',
  authorEmail: 'lpig0818@gmail.com',
  keywords: ['aws', 'ec2', 'cdk', 'typescript'],
  release: false,
  stability: 'experimental',
  autoDetectBin: false,
  dependabot: false,
  cdkVersion: '1.151.0',
  // Default release the main branch with major version 1.
  majorVersion: 1,
  defaultReleaseBranch: 'master',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
  ],
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      // The secret default name use  PROJEN_GITHUB_TOKEN, please add your PAT token in this repository secret.
      // ref: https://github.com/projen/projen/blob/e5899dd04a575209424a08fe90bde99e07ac6c7b/src/github/github.ts#L46-L53
      labels: ['auto-approve', 'auto-merge'],
    },
  },
  autoApproveOptions: {
    // deepcode ignore HardcodedNonCryptoSecret: Allow to preform GitHub Actions
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['baboopan'],
  },
  devDeps: [
    'esbuild',
  ],
  gitignore: [
    '.vscode',
    '.dccache',
    'cdk.out',
    'cdk.context.json',
    'yarn-error.log',
    'coverage',
    'venv',
  ],
});

project.synth();
