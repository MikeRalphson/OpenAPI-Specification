'use strict';

const fs = require('fs');
const util = require('util');

const yaml = require('js-yaml');
const jsonschema = require('jsonschema').Validator;
const options = { base: process.argv[2] };
const validator = new jsonschema(options);

const schema = yaml.safeLoad(fs.readFileSync(process.argv[2],'utf8'),{json:true});
const metaSchema = yaml.safeLoad(fs.readFileSync(process.argv[3],'utf8'),{json:true});

const result = validator.validate(schema, metaSchema);

if (result.errors.length) {
  console.warn(util.inspect(result.errors));
  process.exit(1);
}

