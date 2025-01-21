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

const getStars = async (user, page) => {
  const response = await got(`https://api.github.com/users/${user}/starred?page=${page}`)
    .catch(error => {
      console.error(kleur.red().bold(`Unable to get stars (${error.response?.statusCode} ${error.response?.statusMessage})`));
      process.exit(1);
    });

  const starred = JSON.parse(response.body);

  if (starred.length === 0) {
    console.warn(kleur.yellow().bold(`${user} doesn’t have any starred repositories yet.`));
    process.exit(0);
  }

  return starred.map(s => ({
    owner: s.owner.login,
    repo: s.name,
  }));
};

const getRandomPage = async user => {
  const response = await got(`https://api.github.com/users/${user}/starred`)
    .catch(error => {
      console.error(kleur.red().bold(`Unable to get random page (${error.response?.statusCode} ${error.response?.statusMessage})`));
      process.exit(1);
    });

  const pages = response.headers.link ? response.headers.link.replace(lastPage, '$2') : 1;
  return random.int(1, Number(pages));
};

const page = await getRandomPage(user);
const results = await getStars(user, page);
const result = results[random.int(0, results.length - 1)];

console.log(kleur.green().bold(`https://github.com/${result.owner}/${result.repo}`));
