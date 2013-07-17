# BusterMove [![Build Status](https://secure.travis-ci.org/rvagg/node-bustermove.png)](http://travis-ci.org/rvagg/node-bustermove)

[![NPM](https://nodei.co/npm/bustermove.png)](https://nodei.co/npm/bustermove/)

![Hammer Time](http://i.gif.ly/d68bca81.gif)

A simple drop-in replacement for [Buster](http://busterjs.org/) in Node.js.

Uses [node-tap](https://github.com/isaacs/node-tap) as the test runner for now (probably until the the standard Buster test runner is working on Node 0.10).

Supports basic Buster functionality, including [Sinon](http://sinonjs.org/) and [referee](https://github.com/busterjs/referee) integration and structured test suites:

```js
var buster = require('bustermove')
  , assert = buster.assert // 'referee' is the new name for buster-assert
  , refute = buster.refute

buster.testCase('My funky tests', {
    'setUp': function (done) {
      // .. some setup stuff, run before each test, including nested tests
      done()
    }

  , 'tearDown': function (done) {
      // .. some teardown stuff, run after each test, including nested tests
      done()
    }

  , 'test something': function (done) {
      // .. whatever you're testing

      // each of these will be automatically cleaned up after the test is run
      var spy  = this.spy()
        , stub = this.stub()
        , mock = this.mock()

      done()
    }

  , 'nested': {
        'setUp': function (done) {
          // .. run after the parent setUp but before each of the nested tests
          done()          
        }

        // tearDown if you like

      , 'test nested': function (done) {
          // .. something else to test
          done()
        }
    }
})
```

You then run the test with either `node ./tests.js` or if you like, `tap *-tests.js` as it creates node-tap compatible tests.

Currently only `this.spy()`, `this.stub()` and `this.mock()` are supported in the sandbox but it's possible to make it more complete. Send me a pull request if you need it.

## Licence

BusterMove is Copyright (c) 2012 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.