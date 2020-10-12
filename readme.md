# Pypi Secret Access Management For Pypi Secrets

This repo is used to manage the list of repositories requiring push access to Pypi.

# How to request access for a repository

1. Edit the [./src/pypi-limeci.mjs](src/pypi-limeci.mjs) file
2. Add you repository to the list
3. Commit your changes to a new branch and open a PR
4. Request review from @anderssonjohan, @thomaslundstrom or @jensgustafsson
5. When the PR is merged your repo will have access to the secret

# Contribute

You will need to have GitHub organization admin access to test things locally.

1. Clone repo
2. Create a personal access token with permissions `repo` and `admin:org`
3. Create a `.env` file with the line: `export GITHUB_TOKEN=<token created>`
4. Run `npm run dev` to sync the list of repos to the org secret named TEST_SECRET

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
Current repositories configured for secret:
{
  'Lundalogik/limepkg-workorder': 268804070,
  'Lundalogik/solution-workorder': 303311048
}
Updating secret with configured repositories
Status: 204
```