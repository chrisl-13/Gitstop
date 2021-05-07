const axios = require('axios');
const { Octokit } = require('@octokit/core');
const { graphql } = require("@octokit/graphql");
require('dotenv').config();

let token = null;

const oauthController = {};

const clientID = process.env.GITHUB_AUTH_ID;
const clientSecret = process.env.GITHUB_AUTH_SECRET;

oauthController.authWithGithub = (req, res, next) => {
  console.log('inside authWithGithub');
  const body = {
    client_id: clientID,
    client_secret: clientSecret,
    code: req.query.code,
  };
  console.log(body);
  const opts = { headers: { accept: 'application/json' } };
  axios.post('https://github.com/login/oauth/access_token', body, opts)
    .then((result) => result.data.access_token)
    .then((_token) => {
      token = _token;
      console.log('My token:', token);
      next();
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

oauthController.addUser = async (req, res, next) => {
  const octokit = new Octokit({ auth: token });
  // let data;
  // data = await octokit.request("GET /user/repos")
  const response = await octokit.graphql(
    `query {
      viewer {
        login
        repositories(last: 3, affiliations: OWNER, orderBy: {field: UPDATED_AT, direction: ASC}) {
          nodes {
            id
            name
            parent {
              id
              name
              issues(last: 3) {
                nodes {
                  id
                  body
                  comments(last: 3) {
                    nodes {
                      body
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
  )
    .then((data) => {
      console.log('username', data.viewer.login);
      console.log('repos', data.viewer.repositories.nodes);
      data.viewer.repositories.nodes.forEach((repo) => {
        console.log('repo', repo.parent.name);
        if (repo.parent.issues.nodes.length !== 0) {
          repo.parent.issues.nodes.forEach((issue) => {
            console.log('issue', issue.body);
            if (issue.comments.nodes.length !== 0) {
              issue.comments.nodes.forEach((comment) => {
                console.log('comment', comment.body);
              });
            }
          });
        }
      });
      next();
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

module.exports = oauthController;
