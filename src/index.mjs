import repositories from './pypi-limeci.mjs';
import { Octokit } from '@octokit/action';

const githubOrgName = 'Lundalogik'
const secret_names = (process.env.SECRET_NAMES || 'TEST_SECRET,TEST_SECRET_PASS').split(',');
const octokit = new Octokit();

const toRepoIdAndName = repo => ({ [repo.full_name]: repo.id });
const getRepo = (name) =>
    octokit.repos.get({ owner: githubOrgName, repo: name });
const getIdAndFullName = async (name) => {
    const { data } = await getRepo(name);
    return toRepoIdAndName(data);
};
const mergeObjects = (objs) => objs.reduce((result, obj) => ({ ...result, ...obj }), {});
const getCurrentReposFromSecret = async (secret_name) => {
    const { data } = await octokit.request(
        'GET /orgs/{org}/actions/secrets/{secret_name}/repositories',
        {
            org: githubOrgName,
            secret_name: secret_name
        });
    return mergeObjects(data.repositories.map(toRepoIdAndName));
};
const putReposToSecret = async (secret_name, repository_ids) =>
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

for (var secret_name of secret_names) {
    const current_repositories = await getCurrentReposFromSecret(secret_name);
    console.log(`Current repositories configured for secret ${secret_name}:`);
    console.log(current_repositories);
}

console.log('Updating secrets with configured repositories');
for (var secret_name of secret_names) {
    const { status } = await putReposToSecret(secret_name, Object.values(configured_repos));
    console.log(`${secret_name}: ${status}`);
}

console.log('Done');