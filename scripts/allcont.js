'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const assert = require('assert');
const fetch = require('node-fetch');

const token = process.env['GH_TOKEN'];
const auth = 'Basic ' + Buffer.from('mermade:' + token).toString('base64');

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });
const bobwAgent = function(_parsedURL) {
  if (_parsedURL.protocol == 'http:') {
    return httpAgent;
  } else {
    return httpsAgent;
  }
}

let authors = {};
const contrib = {};

function where(path) {
  let result = 'doc';
  if (path) {
    if (path.indexOf('.js')>=0) result = 'code';
    if (path.indexOf('.scala')>=0) result = 'code';
    if (path.indexOf('.json')>=0) result = 'example';
    if (path.indexOf('.yaml')>=0) result = 'example';
    if (path.indexOf('amples')>=0) result = 'example';
    if (path.indexOf('fixtures')>=0) result = 'example';
  }
  return result;
}

// https://api.github.com/repos/OAI/OpenAPI-Specification/commits/5e939f7437829de698fc38eff2c6b590d241e462
// .author.login

async function main() {
  let lookup = {};
  if (fs.existsSync('./lookup.json')) {
    lookup = JSON.parse(fs.readFileSync('./lookup.json','utf8'));
  }
  else {
    for (let author in authors) {
      for (let commit of authors[author]) {
        try {
          const res = await fetch('https://api.github.com/repos/OAI/OpenAPI-Specification/commits/'+commit,{ agent: bobwAgent, headers: { 'User-Agent': 'mermade', Authorization: auth } });
          const o = await res.json();
          if (o && o.author && o.commit && author.indexOf(o.commit.author.email)>=0) {
            console.log(2,author,o.author.login,commit);
            lookup[author] = o.author.login;
          }
        }
        catch (ex) {
          console.warn(ex.message);
        }
      }
    }
  } 

  fs.writeFileSync('./lookup.json',JSON.stringify(lookup,null,2),'utf8');

  const l = fs.readFileSync('./gitlog.txt','utf8').split('\r').join('').split('\n');
  let c = 0;
  while (c<l.length) {
    console.warn(c,l[c]);
    assert(l[c].startsWith('commit'));
    const commit = l[c++];
    if (l[c] && l[c].startsWith('Merge: ')) c++;
    let author = l[c++];
    const date = l[c++];
    while (!l[c] || l[c].startsWith('    ')) { // the commit message
      c++;
    }

    author = author.replace('Author: ','');
  
    const handle = lookup[author];
    if (!contrib[handle]) contrib[handle] = '';
  
    while (l[c] !== '' && !l[c].startsWith('commit') && c<l.length) {
      console.log(3,commit,author,date,l[c]);
      const locn = where(l[c]);
      if (contrib[handle].indexOf(locn)<0) {
        contrib[handle] += locn+',';
      }
      c++;
    }
    if (!l[c].startsWith('commit')) c++;
  }

  for (let handle in contrib) {
     console.log('@allcontributors please add @'+handle,'for',contrib[handle]);
  }
}

const a = fs.readFileSync('./authors.txt','utf8').split('\r').join('').split('\n');
for (let line of a) {
  if (line) {
    let fields = line.split(' ');
    const commit = fields[0];
    const date = fields[1];
    let author = '';
    for (let i=2;i<fields.length;i++) {
      author += fields[i]+' ';
    }
    author = author.trim();
    if (!authors[author]) authors[author] = [];
    authors[author].push(commit);
  }
}

main();
