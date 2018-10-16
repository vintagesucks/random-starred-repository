"use strict";

const got = require("got");

let user = process.argv.slice(2)[0];
let randomEntry = Math.floor(Math.random() * 29) + 0;
let lastPage = new RegExp(/(.*)page=(.*)>; rel=\"last\"/);

if (!user) {
  console.log("Usage: `node index.js username`");
  process.exit(1);
}

const getStars = (user, page) =>
  got(`https://api.github.com/users/${user}/starred?page=${page}`)
    .then((res) => JSON.parse(res.body))
    .then((starred) =>
      starred.map((s) => ({
        owner: s.owner.login,
        repo: s.name
      }))
    );

const getRandomPage = (user) =>
  got(`https://api.github.com/users/${user}/starred`)
    .then((res) =>
      res.headers.link
        .replace(lastPage, "$2")
    )
    .then((pages) => Math.floor(Math.random() * pages) + 1);

getRandomPage(user, randomEntry)
  .then((page) => getStars(user, page))
  .then((result) =>
    console.log("https://github.com/" + result[randomEntry].owner + "/" + result[randomEntry].repo)
  );
