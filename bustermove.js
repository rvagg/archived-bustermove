/* Copyright (c) 2012-2013 Rod Vagg, MIT License */

var taptest
  , sinon   = require('sinon')
  , referee = require('referee')

try {
  taptest = require('tap').test
} catch (e) {}

if (typeof taptest != 'function')
  taptest = require('tape')

function createAsyncTestFn (ctx, testFn) {
  if (!testFn) return function (done) { done() }
  if (testFn.length) return testFn.bind(ctx)
  return function (done) {
    testFn.call(ctx)
    done()
  }
}

function createSetUp (ctx, preSetUp, setUp) {
  preSetUp = createAsyncTestFn(ctx, preSetUp)
  setUp    = createAsyncTestFn(ctx, setUp)
  return function (done) {
    preSetUp(function () {
      setUp(done)
    })
  }
}

function createTearDown (ctx, postTearDown, tearDown) {
  postTearDown = createAsyncTestFn(ctx, postTearDown)
  tearDown     = createAsyncTestFn(ctx, tearDown)
  return function (done) {
    tearDown(function () {
      postTearDown(done)
    })
  }
}

var buster = {
  testCase: function (suiteName, tests, ctx, preSetUp, postTearDown) {
    if (!ctx) {
      ctx = sinon.sandbox.create({
          injectInto    : null
        , properties    : [ 'spy', 'stub', 'mock' ]
        , useFakeTimers : false
        , useFakeServer : false
      })
    }
    var setUp    = createSetUp(ctx, preSetUp, tests.setUp)
      , tearDown = createTearDown(ctx, postTearDown, tests.tearDown)
      , name

    for (name in tests) {
      if (name != 'setUp' && name != 'tearDown') {
        if (typeof tests[name] == 'object') {
          buster.testCase(suiteName + ': ' + name, tests[name], ctx, setUp, tearDown)
          continue
        }

        ;(function (name) {
          var test = createAsyncTestFn(ctx, tests[name])
            , cfg  = {}

          if (ctx.timeout) cfg.timeout = ctx.timeout

          taptest(suiteName + ': ' + name, cfg, function (t) {
            function execute () {
              t.ok(true, suiteName + ': ' + name) // blank assert to tell tap we're really a test!
              setUp(function () {
                test(function () {
                  tearDown(function () {
                    ctx.restore()
                    t.end()
                  })
                })
              })
            }
            if (process.browser)
              return setTimeout(execute, 0) // firefox recursion issue with tape
            execute()
          })
        }(name))
      }
    }
  }
}

module.exports         = buster
module.exports.assert  = referee.assert
module.exports.refute  = referee.refute
module.exports.fail    = referee.fail
module.exports.referee = referee
module.exports.sinon   = sinon
