const http = require('http');
const react = require('react');
const poneglyph = require('.');

http.createServer(poneglyph.createServer({
  buildDir: 'output'
}, [
  {
    path: '/a',
    resourceID: '0',
    entrypoint: 'a',
    Component: () => react.createElement('h1', {}, ['Hello World']),
  }
])).listen(3000);