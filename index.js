#!/usr/bin/env node

import process from 'node:process';
import got from 'got';
import kleur from 'kleur';
import random from 'random';

const user = process.argv.slice(2)[0];
const randomEntry = random.int(0, 29);
const lastPage = new RegExp(/(.*)page=(.*)>; rel="last"/);

if (!user) {
  console.log('Usage: `npx -q random-starred-repository username`');
  process.exit(1);
}

const getStars = (user, page) =>
  got(`https://api.github.com/users/${user}/starred?page=${page}`)
    .then(response => JSON.parse(response.body))
    .then(starred =>
      starred.map(s => ({
        owner: s.owner.login,
        repo: s.name,
      })),
    )
    .catch(error => {
      console.error(kleur.red().bold('Unable to get stars (' + error.statusCode + ' ' + error.statusMessage + ')'));
      process.exit(0);
    });

const getRandomPage = user =>
  got(`https://api.github.com/users/${user}/starred`)
    .then(response =>
      response.headers.link
        .replace(lastPage, '$2'),
    )
    .then(pages => random.int(1, Number(pages)))
    .catch(error => console.error(kleur.red().bold('Unable to get random page, falling back to first page (' + error.statusCode + ' ' + error.statusMessage + ')')));

getRandomPage(user)
  .then(page => getStars(user, page))
  .then(result =>
    console.log(kleur.green().bold(
      'https://github.com/' + result[randomEntry].owner + '/' + result[randomEntry].repo,
    )),
  );