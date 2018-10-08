"use strict";

const got = require("got");

let user = process.argv.slice(2)[0];

if (!user) {
  console.log("Usage: `node index.js username`");
  process.exit(1);
}

const stars = (user, page) =>
  got(`https://api.github.com/users/${user}/starred?page=${page}`)
    .then(res => JSON.parse(res.body))
    .then(starred =>
      starred.map(s => ({
        owner: s.owner.login,
        repo: s.name
      }))
    );

const randomPage = user =>
  got(`https://api.github.com/users/${user}/starred`)
    .then(res =>
      res.headers.link
        .split(",")[1]
        .split("page=")
        .pop()
        .split(">")
        .shift()
    )
    .then(pages => Math.floor(Math.random() * pages) + 1);

randomPage(user)
  .then(page => stars(user, page))
  .then(result =>
    console.log("https://github.com/" + result[0].owner + "/" + result[0].repo)
  );
