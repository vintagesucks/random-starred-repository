#!/usr/bin/env node

import process from 'node:process';
import got from 'got';
import kleur from 'kleur';
import random from 'random';

const user = process.argv.slice(2)[0];
const lastPage = /(.*)page=(.*)>; rel="last"/;

if (!user) {
  console.log('Usage: `npx -q random-starred-repository username`');
  process.exit(1);
}

const getStars = (user, page) =>
  got(`https://api.github.com/users/${user}/starred?page=${page}`)
    .then(response => JSON.parse(response.body))
    .then(response => {
      if (response.length === 0) {
        console.warn(kleur.yellow().bold(user + ' doesn’t have any starred repositories yet.'));
        process.exit(0);
      }

      return response;
    })
    .then(starred =>
      starred.map(s => ({
        owner: s.owner.login,
        repo: s.name,
      })),
    )
    .catch(error => {
      console.error(kleur.red().bold('Unable to get stars (' + error.response.statusCode + ' ' + error.response.statusMessage + ')'));
      process.exit(1);
    });

const getRandomPage = user =>
  got(`https://api.github.com/users/${user}/starred`)
    .then(response => response.headers.link ? response.headers.link.replace(lastPage, '$2') : 1)
    .then(pages => random.int(1, Number(pages)))
    .catch(error => {
      console.error(kleur.red().bold('Unable to get random page (' + error.response.statusCode + ' ' + error.response.statusMessage + ')'));
      process.exit(1);
    });

await getRandomPage(user)
  .then(page => getStars(user, page))
  .then(results => results[random.int(0, results.length - 1)])
  .then(result =>
    console.log(kleur.green().bold(
      'https://github.com/' + result.owner + '/' + result.repo,
    )),
  );