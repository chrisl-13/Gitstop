/* eslint-disable no-unused-expressions */

const express = require('express');
require('dotenv').config();

const router = express.Router();
const clientID = process.env.GITHUB_AUTH_ID;

router.get('/', (req, res) => {
  console.log('logging in');
  res.status(200).redirect(`https://github.com/login/oauth/authorize?client_id=${clientID}&scope=repo%20write:org`);
});

module.exports = router;
