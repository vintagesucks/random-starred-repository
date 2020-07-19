#!/usr/bin/env node

'use strict';

const got = require('got');
const {green, red} = require('kleur');

const user = process.argv.slice(2)[0];
const randomEntry = Math.floor(Math.random() * 30);
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
        repo: s.name
      }))
    )
    .catch(error => {
      console.error(red().bold('Unable to get stars (' + error.statusCode + ' ' + error.statusMessage + ')'));
      process.exit(0);
    });

const getRandomPage = user =>
  got(`https://api.github.com/users/${user}/starred`)
    .then(response =>
      response.headers.link
        .replace(lastPage, '$2')
    )
    .then(pages => Math.floor(Math.random() * pages) + 1)
    .catch(error => console.error(red().bold('Unable to get random page, falling back to first page (' + error.statusCode + ' ' + error.statusMessage + ')')));

getRandomPage(user)
  .then(page => getStars(user, page))
  .then(result =>
    console.log(green().bold(
      'https://github.com/' + result[randomEntry].owner + '/' + result[randomEntry].repo
    ))
  );