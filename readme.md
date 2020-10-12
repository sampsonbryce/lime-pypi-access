# Pypi Secret Access Management For Pypi Secrets

This repo is used to manage the list of repositories requiring push access to Pypi.

# How to request access for a repository for any limer

1. Edit the [./src/pypi-limeci.mjs](src/pypi-limeci.mjs) file
2. Add you repository to the list
3. Commit your changes to a new branch and open a PR
4. Request review from @anderssonjohan, @thomaslundstrom or @jensgustafsson
5. When the PR is merged your repo will have access to the secret

# How to allow access for a repository for a GitHub org admin

1. Merge the PR with changes to [./src/pypi-limeci.mjs](src/pypi-limeci.mjs) file
2. Update your local clone and run `npm run updatesecret` to sync the secrets
   access list with the contents of the file.

_Note: This step could be automated with GitHub Actions but requires protection
       of the .github/workflows folder to avoid risking submission of PRs that
       prints the secret needed to update the secret (`admin:org` required).
       The lack of support to do that is the root cause of why we need to do this.

# Background

There are two severe security issues related to using GitHub Actions and keeping
secrets secure from malicious access. These are the main concerns:

1. Allowing anyone to create a repository and having secrets on org level lets
   any GitHub account in the org to be used to do the following:
   - create a repo
   - run a workflow which prints a secret
   - delete the repo
   - take off with the secret
2. Allowing GitHub accounts in the org push PRs from branches (without creating
   forks) lets these accounts to be used to:
   - clone the repo
   - push a branch and create a PR with a workflow that prints a secret
   - delete the PR/branch
   - take off with the secret

There are also similar scenarios where local runners running in the org's cloud
environment (Azure, AWS, Google) are used as "Trojan horses" where the user with
malicious intents can run code in production, primarily by taking advantage of
having the code executed within the cloud environment, instead of having secrets
to authenticate to some endpoint used to run code in that environment.

References:

- https://github.com/actions/runner/issues/458
- https://github.com/actions/runner/issues/494

# Contribute

This section is for GitHub organization admins to test things locally.

## Setup

1. Clone repo
2. Create a personal access token with permissions `repo` and `admin:org`
3. Create a `.env` file with the line: `export GITHUB_TOKEN=<token created>`

## Update the real secret

Run `npm run updatesecret`.

## Test

Run `npm run dev` to sync the list of repos to the org secret named TEST_SECRET and TEST_SECRET_PASS

Example output:

```
 $ npm run dev

> lime-pypi-access@1.0.0 dev
> source .env && GITHUB_ACTION=1 node ./src/index.mjs

Configured repositories:
{
  'Lundalogik/solution-workorder': 303311048,
  'Lundalogik/limepkg-workorder': 268804070
}
Current repositories configured for secret TEST_SECRET:
{
  'Lundalogik/limepkg-workorder': 268804070,
  'Lundalogik/solution-workorder': 303311048
}
Current repositories configured for secret TEST_SECRET_PASS:
{}
Updating secrets with configured repositories
TEST_SECRET: 204
TEST_SECRET_PASS: 204
Done

```

The numbers printed are the internal repository ID used with GitHub APIs and are
what this tool sends to the API used. The repo names are only used for debugging.

API used to update the secret:
- https://docs.github.com/en/free-pro-team@latest/rest/reference/actions#set-selected-repositories-for-an-organization-secret--parameters