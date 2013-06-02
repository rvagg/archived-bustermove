/* Copyright (c) 2012-2013 Rod Vagg, MIT License */

var tap     = require('tap')
  , sinon   = require('sinon')
  , referee = require('referee')

  , createAsyncTestFn = function (ctx, testFn) {
      if (!testFn) return function (done) { done() }
      if (testFn.length) return testFn.bind(ctx)
      return function (done) {
        testFn.call(ctx)
        done()
      }
    }

  , createSetUp = function (ctx, preSetUp, setUp) {
      preSetUp = createAsyncTestFn(ctx, preSetUp)
      setUp    = createAsyncTestFn(ctx, setUp)
      return function (done) {
        preSetUp(function () {
          setUp(done)
        })
      }
    }

  , createTearDown = function (ctx, postTearDown, tearDown) {
      postTearDown = createAsyncTestFn(ctx, postTearDown)
      tearDown     = createAsyncTestFn(ctx, tearDown)
      return function (done) {
        tearDown(function () {
          postTearDown(done)
        })
      }
    }

  , buster = {
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

        Object.keys(tests).forEach(function (name) {
          if (name != 'setUp' && name != 'tearDown') {
            if (typeof tests[name] == 'object')
              return buster.testCase(suiteName + ': ' + name, tests[name], ctx, setUp, tearDown)
            var test = createAsyncTestFn(ctx, tests[name])
              , cfg  = {}
            if (ctx.timeout) cfg.timeout = ctx.timeout
            tap.test(suiteName + ': ' + name, cfg, function (t) {
              t.ok(true, suiteName + ': ' + name) // blank assert to tell tap we're really a test!
              setUp(function () {
                test(function () {
                  tearDown(function () {
                    ctx.restore()
                    t.end()
                  })
                })
              })
            })
          }
        })
      }
    }

module.exports         = buster
module.exports.assert  = referee.assert
module.exports.refute  = referee.refute
module.exports.referee = referee