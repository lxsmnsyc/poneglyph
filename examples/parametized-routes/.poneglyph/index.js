
if (process.env.NODE_ENV === 'production') {
  require('./production/node/index.js');
} else {
  require('./development/node/index.js');
}
