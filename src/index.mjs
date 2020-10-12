import repositories from './pypi-limeci.mjs';
import { Octokit } from '@octokit/action';

const githubOrgName = 'Lundalogik'
const secret_name = process.env.SECRET_NAME || 'TEST_SECRET';
const octokit = new Octokit();

const toRepoIdAndName = repo => ({ [repo.full_name]: repo.id });
const getRepo = (name) =>
    octokit.repos.get({ owner: githubOrgName, repo: name });
const getIdAndFullName = async (name) => {
    const { data } = await getRepo(name);
    return toRepoIdAndName(data);
};
const mergeObjects = (objs) => objs.reduce((res, rep) => ({ ...res, ...rep }), {});
const getCurrentReposFromSecret = async () => {
    const { data } = await octokit.request(
        'GET /orgs/{org}/actions/secrets/{secret_name}/repositories',
        {
            org: githubOrgName,
            secret_name: secret_name
        });
    return mergeObjects(data.repositories.map(toRepoIdAndName));
};
const putReposToSecret = async (repository_ids) =>
    octokit.request(
        'PUT /orgs/{org}/actions/secrets/{secret_name}/repositories',
        {
            org: githubOrgName,
            secret_name: secret_name,
            selected_repository_ids: repository_ids
        });
const repoIds = await Promise.all(repositories.map(getIdAndFullName));
const configured_repos = mergeObjects(repoIds);

console.log('Configured repositories:');
console.log(configured_repos);

const current_repositories = await getCurrentReposFromSecret();
console.log('Current repositories configured for secret:');
console.log(current_repositories);

console.log('Updating secret with configured repositories');
const { status } = await putReposToSecret(Object.values(configured_repos));
console.log(`Status: ${status}`);