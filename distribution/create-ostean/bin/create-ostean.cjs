#!/usr/bin/env node
const { dispatch } = require('./dispatch.cjs');
dispatch(process.argv.slice(2), true);
