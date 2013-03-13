var tape       = require('tape')
  , tap        = require('tap')
  , bustermove = require('./')

  , tests

tap.test = function (testName, testFn) {
  tests.push({ name: testName, fn: testFn })
}

tape('Basic', function (t) {
  tests = []

  var holder
    , testObj = {
          'test case': function (done) {
            holder = 'booya!'
            done()
          }
      }

  bustermove.testCase('Test Name', testObj)

  t.equal(tests.length, 1, 'one test')
  t.equal(tests[0].name, 'Test Name: test case')
  t.ok(typeof tests[0].fn, 'function')
  tests[0].fn({ end: function () {
    t.ok(holder, 'booya!', 'test main has been run')
    t.end()
  }})
})

tape('setUp and tearDown', function (t) {
  tests = []

  var holder = {}
    , runs = 0
    , testObj = {
          'setUp': function (done) {
            holder.setUp = 'booya!'
            done()
          }

        , 'tearDown': function (done) {
            holder.tearDown = 'booya!'
            done()
          }

        , 'test case': function (done) {
            holder.main = 'booya!'
            done()
          }
      }

  bustermove.testCase('Test Name', testObj)

  t.equal(tests.length, 1)
  t.equal(tests[0].name, 'Test Name: test case')
  t.ok(typeof tests[0].fn, 'function')
  tests[0].fn({ end: function () {
    runs++
    t.ok(holder.main, 'booya!', 'test main has been run')
    t.ok(holder.setUp, 'booya!', 'test setUp has been run')
    t.ok(holder.tearDown, 'booya!', 'test tearDown has been run')
  }})
  t.equal(runs, 1, 't.end() only called once')
  t.end()
})

tape('nested', function (t) {
  tests = []

  var holder = {
          setUp          : 0
        , tearDown       : 0
        , main           : 0
        , inner1main     : 0
        , inner2setUp    : 0
        , inner2main     : 0
        , inner3setUp    : 0
        , inner3tearDown : 0
        , inner3main     : 0
      }
    , testObj = {
          'setUp': function (done) {
            holder.setUp++
            done()
          }

        , 'tearDown': function (done) {
            holder.tearDown++
            done()
          }

        , 'test case': function (done) {
            holder.main++
            done()
          }

        , 'test inner 1': {
              'inner': function (done) {
                holder.inner1main++
                done()
              }
          }

        , 'test inner 2': {
              'setUp': function (done) {
                holder.inner2setUp++
                done()
              }

            , 'inner': function (done) {
                holder.inner2main++
                done()
              }
          }

        , 'test inner 3': {
              'setUp': function (done) {
                holder.inner3setUp++
                done()
              }

            , 'tearDown': function (done) {
                holder.inner3tearDown++
                done()
              }

            , 'inner': function (done) {
                holder.inner3main++
                done()
              }
          }
      }

  bustermove.testCase('Test Name', testObj)

  t.equal(tests.length, 4)

  t.equal(tests[0].name, 'Test Name: test case')
  t.ok(typeof tests[0].fn, 'function')
  tests[0].fn({ end: function () {
    t.deepEqual(holder, {
          setUp          : 1
        , tearDown       : 1
        , main           : 1
        , inner1main     : 0
        , inner2setUp    : 0
        , inner2main     : 0
        , inner3setUp    : 0
        , inner3tearDown : 0
        , inner3main     : 0
    }, 'test has been properly run')
    t.end()
  }})

  t.equal(tests[1].name, 'Test Name: test inner 1: inner')
  t.ok(typeof tests[1].fn, 'function')
  tests[1].fn({ end: function () {
    t.deepEqual(holder, {
          setUp          : 2
        , tearDown       : 2
        , main           : 1
        , inner1main     : 1
        , inner2setUp    : 0
        , inner2main     : 0
        , inner3setUp    : 0
        , inner3tearDown : 0
        , inner3main     : 0
    }, 'test has been properly run')
    t.end()
  }})

  t.equal(tests[2].name, 'Test Name: test inner 2: inner')
  t.ok(typeof tests[2].fn, 'function')
  tests[2].fn({ end: function () {
    t.deepEqual(holder, {
          setUp          : 3
        , tearDown       : 3
        , main           : 1
        , inner1main     : 1
        , inner2setUp    : 1
        , inner2main     : 1
        , inner3setUp    : 0
        , inner3tearDown : 0
        , inner3main     : 0
    }, 'test has been properly run')
    t.end()
  }})

  t.equal(tests[3].name, 'Test Name: test inner 3: inner')
  t.ok(typeof tests[3].fn, 'function')
  tests[3].fn({ end: function () {
    t.deepEqual(holder, {
          setUp          : 4
        , tearDown       : 4
        , main           : 1
        , inner1main     : 1
        , inner2setUp    : 1
        , inner2main     : 1
        , inner3setUp    : 1
        , inner3tearDown : 1
        , inner3main     : 1
    }, 'test has been properly run')
    t.end()
  }})
})