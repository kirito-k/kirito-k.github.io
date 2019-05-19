(function () {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	!(function(global) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }

	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = module.exports;

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  runtime.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  runtime.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  runtime.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  runtime.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration. If the Promise is rejected, however, the
	          // result for this iteration will be rejected with the same
	          // reason. Note that rejections of yielded Promises are not
	          // thrown back into the generator function, as is the case
	          // when an awaited Promise is rejected. This difference in
	          // behavior between yield and await is important, because it
	          // allows the consumer to decide what to do with the yielded
	          // rejection (swallow it and continue, manually .throw it back
	          // into the generator, abandon iteration, whatever). With
	          // await, by contrast, there is no opportunity to examine the
	          // rejection reason outside the generator function, so the
	          // only option is to throw it from the await expression, and
	          // let the generator function handle the exception.
	          result.value = unwrapped;
	          resolve(result);
	        }, reject);
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  runtime.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return runtime.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        if (delegate.iterator.return) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  runtime.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;

	  function doneResult() {
	    return { value: undefined, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined;
	      }

	      return ContinueSentinel;
	    }
	  };
	})(
	  // In sloppy mode, unbound `this` refers to the global object, fallback to
	  // Function constructor if we're in global strict mode. That is sadly a form
	  // of indirect eval which violates Content Security Policy.
	  (function() { return this })() || Function("return this")()
	);
	});

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	function setupWeb3() {
	  return _setupWeb.apply(this, arguments);
	}

	function _setupWeb() {
	  _setupWeb = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            if (window.ethereum) {
	              console.log('window.ethereum');
	              window.web3 = new Web3(window.ethereum);
	            } else if (window.web3) {
	              console.log('window.web3');
	              window.web3 = new Web3(Web3.givenProvider);
	            } else {
	              console.log('INSTALL METAMASK');
	              window.web3 = new Web3();
	            }

	            if (!(window.web3.currentProvider && window.web3.currentProvider.isConnected())) {
	              _context.next = 7;
	              break;
	            }

	            console.log('successfully connected');
	            _context.next = 5;
	            return window.web3.eth.net.getNetworkType(function (err, data) {
	              if (err) {
	                game.network = '';
	              } else {
	                game.network = data;
	              }
	            });

	          case 5:
	            _context.next = 9;
	            break;

	          case 7:
	            console.log("provider not connected");
	            game.network = '';

	          case 9:
	            console.log('game network:', game.network);
	            window.BN = window.web3.utils.BN;

	          case 11:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _setupWeb.apply(this, arguments);
	}

	var collusion = {
	  interface: [{
	    "constant": true,
	    "inputs": [],
	    "name": "MAX_PLAYERS",
	    "outputs": [{
	      "name": "",
	      "type": "uint256"
	    }],
	    "payable": false,
	    "stateMutability": "view",
	    "type": "function",
	    "signature": "0x4411b3eb"
	  }, {
	    "constant": true,
	    "inputs": [],
	    "name": "getTotalPlayers",
	    "outputs": [{
	      "name": "",
	      "type": "uint256"
	    }],
	    "payable": false,
	    "stateMutability": "view",
	    "type": "function",
	    "signature": "0x4529cae7"
	  }, {
	    "constant": false,
	    "inputs": [{
	      "name": "position",
	      "type": "uint256[2]"
	    }],
	    "name": "move",
	    "outputs": [],
	    "payable": false,
	    "stateMutability": "nonpayable",
	    "type": "function",
	    "signature": "0x47cd150d"
	  }, {
	    "constant": true,
	    "inputs": [],
	    "name": "currentGameId",
	    "outputs": [{
	      "name": "",
	      "type": "uint256"
	    }],
	    "payable": false,
	    "stateMutability": "view",
	    "type": "function",
	    "signature": "0x536a3ddc"
	  }, {
	    "constant": true,
	    "inputs": [],
	    "name": "getPlayers",
	    "outputs": [{
	      "name": "",
	      "type": "address[]"
	    }],
	    "payable": false,
	    "stateMutability": "view",
	    "type": "function",
	    "signature": "0x8b5b9ccc"
	  }, {
	    "constant": false,
	    "inputs": [],
	    "name": "start",
	    "outputs": [],
	    "payable": false,
	    "stateMutability": "nonpayable",
	    "type": "function",
	    "signature": "0xbe9a6555"
	  }, {
	    "constant": false,
	    "inputs": [{
	      "name": "player",
	      "type": "uint256"
	    }],
	    "name": "reveal",
	    "outputs": [],
	    "payable": false,
	    "stateMutability": "nonpayable",
	    "type": "function",
	    "signature": "0xc2ca0ac5"
	  }, {
	    "constant": false,
	    "inputs": [{
	      "name": "player",
	      "type": "uint256"
	    }, {
	      "name": "column",
	      "type": "uint256[2]"
	    }],
	    "name": "place",
	    "outputs": [],
	    "payable": false,
	    "stateMutability": "nonpayable",
	    "type": "function",
	    "signature": "0xf28bb934"
	  }, {
	    "anonymous": false,
	    "inputs": [{
	      "indexed": true,
	      "name": "_gameId",
	      "type": "uint256"
	    }, {
	      "indexed": false,
	      "name": "_playerAddress",
	      "type": "address"
	    }],
	    "name": "OnJoin",
	    "type": "event",
	    "signature": "0x97dc0664567158a9c170d5b082e7ae2a58fae10c3e07f2cfb6fb86fe6dcfb88a"
	  }, {
	    "anonymous": false,
	    "inputs": [{
	      "indexed": true,
	      "name": "_gameId",
	      "type": "uint256"
	    }, {
	      "indexed": false,
	      "name": "_playerAddress",
	      "type": "address"
	    }, {
	      "indexed": false,
	      "name": "_position",
	      "type": "uint256[2]"
	    }],
	    "name": "OnMove",
	    "type": "event",
	    "signature": "0x174f14afba076c794752d4ab5ede95f4aa352e40367d7d321477d7fd532761fa"
	  }, {
	    "anonymous": false,
	    "inputs": [{
	      "indexed": true,
	      "name": "_gameId",
	      "type": "uint256"
	    }, {
	      "indexed": false,
	      "name": "_playerAddress",
	      "type": "address"
	    }, {
	      "indexed": false,
	      "name": "_player",
	      "type": "uint256"
	    }, {
	      "indexed": false,
	      "name": "_position",
	      "type": "uint256[2]"
	    }],
	    "name": "OnPlace",
	    "type": "event",
	    "signature": "0x7027c1bb3b8482b2aefc9449e0cc4a30b7c180dd7d3b5f8baad4d9686d8302a2"
	  }, {
	    "anonymous": false,
	    "inputs": [{
	      "indexed": true,
	      "name": "_gameId",
	      "type": "uint256"
	    }, {
	      "indexed": false,
	      "name": "_playerAddress",
	      "type": "address"
	    }, {
	      "indexed": false,
	      "name": "_player",
	      "type": "uint256"
	    }],
	    "name": "OnReveal",
	    "type": "event",
	    "signature": "0xd8fe51dcf4f6d2f9edd88781a2eda7da81209867825e1ae938f73106a61c4b9f"
	  }],
	  address: '0xe44f47486046E39A3Dfbdb8764D17009aa65a885'
	};

	function setupGameState() {
	  return _setupGameState.apply(this, arguments);
	}

	function _setupGameState() {
	  _setupGameState = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            console.log('setting up the game state');
	            game.address = collusion.address;
	            game.contract = getContract();
	            _context.next = 5;
	            return getCurrentGameId();

	          case 5:
	            game.currentGameId = _context.sent;
	            _context.next = 8;
	            return getPastEvents();

	          case 8:
	            game.pastEvents = _context.sent;
	            _context.next = 11;
	            return web3.eth.getCoinbase();

	          case 11:
	            game.playerAddress = _context.sent;
	            game.players = [];
	            game.positions = [];
	            game.action = 'move';
	            console.log('past events:', game.pastEvents);

	          case 16:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _setupGameState.apply(this, arguments);
	}

	function getContract() {
	  return new web3.eth.Contract(collusion.interface, game.address);
	}

	function getCurrentGameId() {
	  return _getCurrentGameId.apply(this, arguments);
	}

	function _getCurrentGameId() {
	  _getCurrentGameId = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
	    return regeneratorRuntime.wrap(function _callee4$(_context4) {
	      while (1) {
	        switch (_context4.prev = _context4.next) {
	          case 0:
	            _context4.next = 2;
	            return game.contract.methods.currentGameId().call();

	          case 2:
	            return _context4.abrupt("return", _context4.sent);

	          case 3:
	          case "end":
	            return _context4.stop();
	        }
	      }
	    }, _callee4);
	  }));
	  return _getCurrentGameId.apply(this, arguments);
	}

	function getPastEvents() {
	  return _getPastEvents.apply(this, arguments);
	}

	function _getPastEvents() {
	  _getPastEvents = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
	    var totalPlayers;
	    return regeneratorRuntime.wrap(function _callee5$(_context5) {
	      while (1) {
	        switch (_context5.prev = _context5.next) {
	          case 0:
	            _context5.next = 2;
	            return game.contract.methods.getTotalPlayers().call();

	          case 2:
	            totalPlayers = _context5.sent;
	            console.log('total players:', totalPlayers);
	            console.log('current round id:', game.currentGameId);

	            if (!(totalPlayers > 3)) {
	              _context5.next = 7;
	              break;
	            }

	            return _context5.abrupt("return", []);

	          case 7:
	            _context5.next = 9;
	            return game.contract.getPastEvents("allEvents", {
	              fromBlock: 0,
	              toBlock: 'latest',
	              filter: {
	                _gameId: game.currentGameId
	              }
	            });

	          case 9:
	            return _context5.abrupt("return", _context5.sent);

	          case 10:
	          case "end":
	            return _context5.stop();
	        }
	      }
	    }, _callee5);
	  }));
	  return _getPastEvents.apply(this, arguments);
	}

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.5' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _library = false;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: _library ? 'pure' : 'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id$1 = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id$1 + px).toString(36));
	};

	var _wks = createCommonjsModule(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	// 7.2.8 IsRegExp(argument)


	var MATCH = _wks('match');
	var _isRegexp = function (it) {
	  var isRegExp;
	  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)


	var SPECIES = _wks('species');
	var _speciesConstructor = function (O, D) {
	  var C = _anObject(O).constructor;
	  var S;
	  return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var at = _stringAt(true);

	 // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var _advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? at(S, index).length : 1);
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	// getting tag from 19.1.3.6 Object.prototype.toString()

	var TAG = _wks('toStringTag');
	// ES3 wrong here
	var ARG = _cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	var _classof = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? _cof(O)
	    // ES3 arguments fallback
	    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

	var builtinExec = RegExp.prototype.exec;

	 // `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var _regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw new TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }
	  if (_classof(R) !== 'RegExp') {
	    throw new TypeError('RegExp#exec called on incompatible receiver');
	  }
	  return builtinExec.call(R, S);
	};

	// 21.2.5.3 get RegExp.prototype.flags

	var _flags = function () {
	  var that = _anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var LAST_INDEX = 'lastIndex';

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/,
	      re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
	})();

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

	    match = nativeExec.call(re, str);

	    if (UPDATES_LAST_INDEX_WRONG && match) {
	      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      // eslint-disable-next-line no-loop-func
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var _regexpExec = patchedExec;

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive$1 = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive$1(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var _functionToString = _shared('native-function-to-string', Function.toString);

	var _redefine = createCommonjsModule(function (module) {
	var SRC = _uid('src');

	var TO_STRING = 'toString';
	var TPL = ('' + _functionToString).split(TO_STRING);

	_core.inspectSource = function (it) {
	  return _functionToString.call(it);
	};

	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
	  if (O[key] === val) return;
	  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if (O === _global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    _hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    _hide(O, key, val);
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
	});
	});

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // extend global
	    if (target) _redefine(target, key, out, type & $export.U);
	    // export
	    if (exports[key] != out) _hide(exports, key, exp);
	    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
	  }
	};
	_global.core = _core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: _regexpExec !== /./.exec
	}, {
	  exec: _regexpExec
	});

	var SPECIES$1 = _wks('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
	  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
	})();

	var _fixReWks = function (KEY, length, exec) {
	  var SYMBOL = _wks(KEY);

	  var DELEGATES_TO_SYMBOL = !_fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;
	    re.exec = function () { execCalled = true; return null; };
	    if (KEY === 'split') {
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$1] = function () { return re; };
	    }
	    re[SYMBOL]('');
	    return !execCalled;
	  }) : undefined;

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var fns = exec(
	      _defined,
	      SYMBOL,
	      ''[KEY],
	      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
	        if (regexp.exec === _regexpExec) {
	          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	            // The native String method already delegates to @@method (this
	            // polyfilled function), leasing to infinite recursion.
	            // We avoid it by directly calling the native @@method method.
	            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	          }
	          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	        }
	        return { done: false };
	      }
	    );
	    var strfn = fns[0];
	    var rxfn = fns[1];

	    _redefine(String.prototype, KEY, strfn);
	    _hide(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return rxfn.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return rxfn.call(string, this); }
	    );
	  }
	};

	var $min = Math.min;
	var $push = [].push;
	var $SPLIT = 'split';
	var LENGTH = 'length';
	var LAST_INDEX$1 = 'lastIndex';
	var MAX_UINT32 = 0xffffffff;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !_fails(function () { });

	// @@split logic
	_fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
	    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
	    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
	    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
	    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
	    ''[$SPLIT](/.?/)[LENGTH]
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(this);
	      if (separator === undefined && limit === 0) return [];
	      // If `separator` is not a regex, use native split
	      if (!_isRegexp(separator)) return $split.call(string, separator, limit);
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = _regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy[LAST_INDEX$1];
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
	          lastLength = match[0][LENGTH];
	          lastLastIndex = lastIndex;
	          if (output[LENGTH] >= splitLimit) break;
	        }
	        if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string[LENGTH]) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
	    };
	  // Chakra, V8
	  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
	    };
	  } else {
	    internalSplit = $split;
	  }

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = defined(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
	      if (res.done) return res.value;

	      var rx = _anObject(regexp);
	      var S = String(this);
	      var C = _speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = _advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	});

	// 21.2.5.3 get RegExp.prototype.flags()
	if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
	  configurable: true,
	  get: _flags
	});

	var TO_STRING = 'toString';
	var $toString = /./[TO_STRING];

	var define = function (fn) {
	  _redefine(RegExp.prototype, TO_STRING, fn, true);
	};

	// 21.2.5.14 RegExp.prototype.toString()
	if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
	  define(function toString() {
	    var R = _anObject(this);
	    return '/'.concat(R.source, '/',
	      'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
	  });
	// FF44- RegExp#toString has a wrong name
	} else if ($toString.name != TO_STRING) {
	  define(function toString() {
	    return $toString.call(this);
	  });
	}

	var f$1 = _wks;

	var _wksExt = {
		f: f$1
	};

	var defineProperty = _objectDp.f;
	var _wksDefine = function (name) {
	  var $Symbol = _core.Symbol || (_core.Symbol = _library ? {} : _global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
	};

	_wksDefine('asyncIterator');

	var _meta = createCommonjsModule(function (module) {
	var META = _uid('meta');


	var setDesc = _objectDp.f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !_fails(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};
	});
	var _meta_1 = _meta.KEY;
	var _meta_2 = _meta.NEED;
	var _meta_3 = _meta.fastKey;
	var _meta_4 = _meta.getWeak;
	var _meta_5 = _meta.onFreeze;

	var def = _objectDp.f;

	var TAG$1 = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var f$2 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$2
	};

	var f$3 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$3
	};

	// all enumerable object keys, includes symbols



	var _enumKeys = function (it) {
	  var result = _objectKeys(it);
	  var getSymbols = _objectGops.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = _objectPie.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	var document$2 = _global.document;
	var _html = document$2 && document$2.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$4
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

	var gOPN = _objectGopn.f;
	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	var f$5 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$5
	};

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive$1(P, true);
	  if (_ie8DomDefine) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$6
	};

	// ECMAScript 6 symbols shim





	var META = _meta.KEY;



















	var gOPD$1 = _objectGopd.f;
	var dP$1 = _objectDp.f;
	var gOPN$1 = _objectGopnExt.f;
	var $Symbol = _global.Symbol;
	var $JSON = _global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE$2 = 'prototype';
	var HIDDEN = _wks('_hidden');
	var TO_PRIMITIVE = _wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols = _shared('symbols');
	var OPSymbols = _shared('op-symbols');
	var ObjectProto = Object[PROTOTYPE$2];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function () {
	  return _objectCreate(dP$1({}, 'a', {
	    get: function () { return dP$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD$1(ObjectProto, key);
	  if (protoDesc) delete ObjectProto[key];
	  dP$1(it, key, D);
	  if (protoDesc && it !== ObjectProto) dP$1(ObjectProto, key, protoDesc);
	} : dP$1;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
	  _anObject(it);
	  key = _toPrimitive$1(key, true);
	  _anObject(D);
	  if (_has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP$1(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = _toPrimitive$1(key, true));
	  if (this === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = _toIobject(it);
	  key = _toPrimitive$1(key, true);
	  if (it === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
	  var D = gOPD$1(it, key);
	  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN$1(_toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto;
	  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto) $set.call(OPSymbols, value);
	      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if (_descriptors && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor;
	  _objectDp.f = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if (_descriptors && !_library) {
	    _redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function (name) {
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

	for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

	_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    $replacer = replacer = args[1];
	    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    if (!_isArray(replacer)) replacer = function (key, value) {
	      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = _wks('unscopables');
	var ArrayProto = Array.prototype;
	if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
	var _addToUnscopables = function (key) {
	  ArrayProto[UNSCOPABLES][key] = true;
	};

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	var _iterators = {};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto$1 = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto$1 : null;
	};

	var ITERATOR = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if (BUGGY || VALUES_BUG || !proto[ITERATOR]) {
	    _hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) _redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') return _iterStep(0, index);
	  if (kind == 'values') return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	_addToUnscopables('keys');
	_addToUnscopables('values');
	_addToUnscopables('entries');

	var ITERATOR$1 = _wks('iterator');
	var TO_STRING_TAG = _wks('toStringTag');
	var ArrayValues = _iterators.Array;

	var DOMIterables = {
	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
	  CSSStyleDeclaration: false,
	  CSSValueList: false,
	  ClientRectList: false,
	  DOMRectList: false,
	  DOMStringList: false,
	  DOMTokenList: true,
	  DataTransferItemList: false,
	  FileList: false,
	  HTMLAllCollection: false,
	  HTMLCollection: false,
	  HTMLFormElement: false,
	  HTMLSelectElement: false,
	  MediaList: true, // TODO: Not spec compliant, should be false.
	  MimeTypeArray: false,
	  NamedNodeMap: false,
	  NodeList: true,
	  PaintRequestList: false,
	  Plugin: false,
	  PluginArray: false,
	  SVGLengthList: false,
	  SVGNumberList: false,
	  SVGPathSegList: false,
	  SVGPointList: false,
	  SVGStringList: false,
	  SVGTransformList: false,
	  SourceBufferList: false,
	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
	  TextTrackCueList: false,
	  TextTrackList: false,
	  TouchList: false
	};

	for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
	  var NAME = collections[i];
	  var explicit = DOMIterables[NAME];
	  var Collection = _global[NAME];
	  var proto = Collection && Collection.prototype;
	  var key;
	  if (proto) {
	    if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
	    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
	    _iterators[NAME] = ArrayValues;
	    if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
	  }
	}

	function setupDOM() {
	  displayFeed();
	  listen();
	  getFutureEvents();
	}

	function listen() {
	  document.querySelector('button[data-action="start"]').addEventListener('click', start);
	  var buttons = document.querySelectorAll('.row div[data-position]');

	  for (var _iterator = buttons, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	    var _ref;

	    if (_isArray) {
	      if (_i >= _iterator.length) break;
	      _ref = _iterator[_i++];
	    } else {
	      _i = _iterator.next();
	      if (_i.done) break;
	      _ref = _i.value;
	    }

	    var button = _ref;
	    button.addEventListener('click', function (event) {
	      takeAction(event);
	    });
	  }

	  document.querySelector('.action-selection [data-action="move"]').addEventListener('click', selectActionMove);
	  document.querySelector('.action-selection [data-action="place"]').addEventListener('click', selectActionPlace);
	  document.querySelector('.action-selection [data-action="reveal"]').addEventListener('click', selectActionReveal);
	}

	function start() {
	  return _start.apply(this, arguments);
	}

	function _start() {
	  _start = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
	    var from, to, data, value;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _context.next = 2;
	            return web3.eth.getCoinbase();

	          case 2:
	            from = _context.sent;
	            to = game.address;
	            data = game.contract.methods.start().encodeABI();
	            value = new BN('0');
	            web3.eth.sendTransaction({
	              from: from,
	              to: to,
	              value: value,
	              data: data
	            }).on('transactionHash', function (hash) {}).on('receipt', function (receipt) {}).on('confirmation', function (nonce, receipt) {}).on('error', console.error);
	            document.querySelector('button[data-action="start"]').style.display = 'none';

	          case 8:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _start.apply(this, arguments);
	}

	function takeAction(_x) {
	  return _takeAction.apply(this, arguments);
	}

	function _takeAction() {
	  _takeAction = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(e) {
	    var coord;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            console.log('take action adsf:', e.target);
	            coord = e.target.dataset.position;
	            console.log('coord', coord);
	            console.log('game action', game.action);

	            if (!(game.action === 'move')) {
	              _context2.next = 7;
	              break;
	            }

	            _context2.next = 7;
	            return sendMove(coord);

	          case 7:
	            if (game.action === 'place') ;

	            if (game.action === 'reveal') ;

	          case 9:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2);
	  }));
	  return _takeAction.apply(this, arguments);
	}

	function sendMove(_x2) {
	  return _sendMove.apply(this, arguments);
	}

	function _sendMove() {
	  _sendMove = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(position) {
	    var from, to, data, value;
	    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            console.log('sendMove', position);
	            _context3.next = 3;
	            return web3.eth.getCoinbase();

	          case 3:
	            from = _context3.sent;
	            to = game.address;
	            data = game.contract.methods.move(position.split(',')).encodeABI();
	            value = new BN('0');
	            web3.eth.sendTransaction({
	              from: from,
	              to: to,
	              value: value,
	              data: data
	            });

	          case 8:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3);
	  }));
	  return _sendMove.apply(this, arguments);
	}

	function selectActionMove(e) {
	  setActiveAction(e.target);
	}

	function selectActionPlace(e) {
	  setActiveAction(e.target);
	}

	function selectActionReveal(e) {
	  setActiveAction(e.target);
	}

	function setActiveAction(selectedAction) {
	  var actions = document.querySelectorAll('.action-selection button');
	  [].forEach.call(actions, function (action) {
	    action.classList.remove('active');
	  });
	  selectedAction.classList.add('active');
	  game.action = selectedAction.dataset.action;
	}

	function getFutureEvents() {
	  game.contract.events.allEvents(function (error, event) {
	    displayEvent(event);
	  });
	}

	function displayFeed() {
	  var markup = game.pastEvents.map(function (pastEvent) {
	    var event = pastEvent.event,
	        transactionHash = pastEvent.transactionHash,
	        returnValues = pastEvent.returnValues;

	    if (returnValues._gameId !== game.currentGameId) {
	      return;
	    }

	    return "<div class=\"event\" data-event=\"" + event + "\">\n\t\t\t" + createCard(pastEvent) + "\n\t\t</div>";
	  }).reverse();
	  document.querySelector('.event-feed').innerHTML += markup.join('');
	}

	function displayEvent(event) {
	  console.log('displayEvent:', event);
	  var markup = "<div class=\"event\" data-event=\"" + event.event + "\">\n\t\t" + createCard(event) + "\n\t</div>";
	  console.log('markup:', markup);
	  document.querySelector('.event-feed').innerHTML = markup + document.querySelector('.event-feed').innerHTML;
	}

	function createCard(_ref2) {
	  var event = _ref2.event,
	      transactionHash = _ref2.transactionHash,
	      returnValues = _ref2.returnValues;
	  console.log('create card:', event);

	  if (event === 'OnJoin') {
	    return createOnJoin();
	  } else if (event === 'OnMove') {
	    return createOnMove();
	  } else if (event === 'OnPlace') {
	    return createOnPlace();
	  }

	  function createOnJoin() {
	    var _playerAddress = returnValues._playerAddress,
	        _gameId = returnValues._gameId;
	    game.players.push(toCheckSumAddress(_playerAddress));

	    if (game.players.indexOf(toCheckSumAddress(game.playerAddress)) > -1) {
	      document.querySelector('button[data-action="start"]').style.display = 'none';
	      document.querySelector('.action-selection').style.display = '';
	    }

	    return "<div>" + _playerAddress.substring(0, 21) + "</div><div>is Ready to Collude</div>";
	  }

	  function createOnMove() {
	    var _playerAddress = returnValues._playerAddress,
	        _position = returnValues._position;
	    console.log('create on move:', _playerAddress, _position);
	    return "<div>" + _playerAddress.substring(0, 21) + "</div><div>Moved to " + _position + "</div>";
	  }
	}

	function toCheckSumAddress(address) {
	  return web3.utils.toChecksumAddress(address);
	}

	window.game = window.game || {};

	function startTheEngine() {
	  return _startTheEngine.apply(this, arguments);
	}

	function _startTheEngine() {
	  _startTheEngine = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _context.next = 2;
	            return setupWeb3();

	          case 2:
	            _context.next = 4;
	            return setupGameState();

	          case 4:
	            setupDOM();

	          case 5:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _startTheEngine.apply(this, arguments);
	}

	startTheEngine();

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwiLi4vLi4vLi4vLi4vY2xpZW50L3NyYy9nYW1lL3NldHVwV2ViMy5qcyIsIi4uLy4uLy4uLy4uL2NsaWVudC9zcmMvY29udHJhY3RzL2NvbGx1c2lvbi5zb2wuanMiLCIuLi8uLi8uLi8uLi9jbGllbnQvc3JjL2dhbWUvc2V0dXBHYW1lU3RhdGUuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2YuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLXJlZ2V4cC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zdHJpbmctYXQuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hZHZhbmNlLXN0cmluZy1pbmRleC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWdleHAtZXhlYy1hYnN0cmFjdC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2ZsYWdzLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVnZXhwLWV4ZWMuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mdW5jdGlvbi10by1zdHJpbmcuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2N0eC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5leGVjLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZml4LXJlLXdrcy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5zcGxpdC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5mbGFncy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC50by1zdHJpbmcuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MtZXh0LmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLWRlZmluZS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnN5bWJvbC5hc3luYy1pdGVyYXRvci5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lvYmplY3QuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tYWJzb2x1dGUtaW5kZXguanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2VudW0ta2V5cy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2h0bWwuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wZC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FkZC10by11bnNjb3BhYmxlcy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItc3RlcC5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXJhdG9ycy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdwby5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCIuLi8uLi8uLi8uLi9jbGllbnQvc3JjL2dhbWUvc2V0dXBET00uanMiLCIuLi8uLi8uLi8uLi9jbGllbnQvc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcnVudGltZS5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBJbiBzbG9wcHkgbW9kZSwgdW5ib3VuZCBgdGhpc2AgcmVmZXJzIHRvIHRoZSBnbG9iYWwgb2JqZWN0LCBmYWxsYmFjayB0b1xuICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvciBpZiB3ZSdyZSBpbiBnbG9iYWwgc3RyaWN0IG1vZGUuIFRoYXQgaXMgc2FkbHkgYSBmb3JtXG4gIC8vIG9mIGluZGlyZWN0IGV2YWwgd2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kuXG4gIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfSkoKSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKClcbik7XG4iLCJleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBzZXR1cFdlYjMoKSB7XG4gIGlmICh3aW5kb3cuZXRoZXJldW0pIHtcbiAgICBjb25zb2xlLmxvZygnd2luZG93LmV0aGVyZXVtJyk7XG4gICAgd2luZG93LndlYjMgPSBuZXcgV2ViMyh3aW5kb3cuZXRoZXJldW0pO1xuICB9IGVsc2UgaWYgKHdpbmRvdy53ZWIzKSB7XG4gICAgY29uc29sZS5sb2coJ3dpbmRvdy53ZWIzJyk7XG4gICAgd2luZG93LndlYjMgPSBuZXcgV2ViMyhXZWIzLmdpdmVuUHJvdmlkZXIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdJTlNUQUxMIE1FVEFNQVNLJyk7XG4gICAgd2luZG93LndlYjMgPSBuZXcgV2ViMygpO1xuICB9XG5cbiAgaWYod2luZG93LndlYjMuY3VycmVudFByb3ZpZGVyICYmIHdpbmRvdy53ZWIzLmN1cnJlbnRQcm92aWRlci5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgY29uc29sZS5sb2coJ3N1Y2Nlc3NmdWxseSBjb25uZWN0ZWQnKTtcbiAgICBhd2FpdCB3aW5kb3cud2ViMy5ldGgubmV0LmdldE5ldHdvcmtUeXBlKChlcnIsIGRhdGEpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgZ2FtZS5uZXR3b3JrID0gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnYW1lLm5ldHdvcmsgPSBkYXRhO1xuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJwcm92aWRlciBub3QgY29ubmVjdGVkXCIpO1xuICAgIGdhbWUubmV0d29yayA9ICcnO1xuICB9XG4gIGNvbnNvbGUubG9nKCdnYW1lIG5ldHdvcms6JywgZ2FtZS5uZXR3b3JrKTtcblxuICB3aW5kb3cuQk4gPSB3aW5kb3cud2ViMy51dGlscy5CTjtcbn0iLCJcbiAgICAgIGV4cG9ydCBkZWZhdWx0IHtcbiAgICAgICAgaW50ZXJmYWNlOiBbXG4gIHtcbiAgICBcImNvbnN0YW50XCI6IHRydWUsXG4gICAgXCJpbnB1dHNcIjogW10sXG4gICAgXCJuYW1lXCI6IFwiTUFYX1BMQVlFUlNcIixcbiAgICBcIm91dHB1dHNcIjogW1xuICAgICAge1xuICAgICAgICBcIm5hbWVcIjogXCJcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlwiXG4gICAgICB9XG4gICAgXSxcbiAgICBcInBheWFibGVcIjogZmFsc2UsXG4gICAgXCJzdGF0ZU11dGFiaWxpdHlcIjogXCJ2aWV3XCIsXG4gICAgXCJ0eXBlXCI6IFwiZnVuY3Rpb25cIixcbiAgICBcInNpZ25hdHVyZVwiOiBcIjB4NDQxMWIzZWJcIlxuICB9LFxuICB7XG4gICAgXCJjb25zdGFudFwiOiB0cnVlLFxuICAgIFwiaW5wdXRzXCI6IFtdLFxuICAgIFwibmFtZVwiOiBcImdldFRvdGFsUGxheWVyc1wiLFxuICAgIFwib3V0cHV0c1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwibmFtZVwiOiBcIlwiLFxuICAgICAgICBcInR5cGVcIjogXCJ1aW50MjU2XCJcbiAgICAgIH1cbiAgICBdLFxuICAgIFwicGF5YWJsZVwiOiBmYWxzZSxcbiAgICBcInN0YXRlTXV0YWJpbGl0eVwiOiBcInZpZXdcIixcbiAgICBcInR5cGVcIjogXCJmdW5jdGlvblwiLFxuICAgIFwic2lnbmF0dXJlXCI6IFwiMHg0NTI5Y2FlN1wiXG4gIH0sXG4gIHtcbiAgICBcImNvbnN0YW50XCI6IGZhbHNlLFxuICAgIFwiaW5wdXRzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJuYW1lXCI6IFwicG9zaXRpb25cIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlsyXVwiXG4gICAgICB9XG4gICAgXSxcbiAgICBcIm5hbWVcIjogXCJtb3ZlXCIsXG4gICAgXCJvdXRwdXRzXCI6IFtdLFxuICAgIFwicGF5YWJsZVwiOiBmYWxzZSxcbiAgICBcInN0YXRlTXV0YWJpbGl0eVwiOiBcIm5vbnBheWFibGVcIixcbiAgICBcInR5cGVcIjogXCJmdW5jdGlvblwiLFxuICAgIFwic2lnbmF0dXJlXCI6IFwiMHg0N2NkMTUwZFwiXG4gIH0sXG4gIHtcbiAgICBcImNvbnN0YW50XCI6IHRydWUsXG4gICAgXCJpbnB1dHNcIjogW10sXG4gICAgXCJuYW1lXCI6IFwiY3VycmVudEdhbWVJZFwiLFxuICAgIFwib3V0cHV0c1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwibmFtZVwiOiBcIlwiLFxuICAgICAgICBcInR5cGVcIjogXCJ1aW50MjU2XCJcbiAgICAgIH1cbiAgICBdLFxuICAgIFwicGF5YWJsZVwiOiBmYWxzZSxcbiAgICBcInN0YXRlTXV0YWJpbGl0eVwiOiBcInZpZXdcIixcbiAgICBcInR5cGVcIjogXCJmdW5jdGlvblwiLFxuICAgIFwic2lnbmF0dXJlXCI6IFwiMHg1MzZhM2RkY1wiXG4gIH0sXG4gIHtcbiAgICBcImNvbnN0YW50XCI6IHRydWUsXG4gICAgXCJpbnB1dHNcIjogW10sXG4gICAgXCJuYW1lXCI6IFwiZ2V0UGxheWVyc1wiLFxuICAgIFwib3V0cHV0c1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwibmFtZVwiOiBcIlwiLFxuICAgICAgICBcInR5cGVcIjogXCJhZGRyZXNzW11cIlxuICAgICAgfVxuICAgIF0sXG4gICAgXCJwYXlhYmxlXCI6IGZhbHNlLFxuICAgIFwic3RhdGVNdXRhYmlsaXR5XCI6IFwidmlld1wiLFxuICAgIFwidHlwZVwiOiBcImZ1bmN0aW9uXCIsXG4gICAgXCJzaWduYXR1cmVcIjogXCIweDhiNWI5Y2NjXCJcbiAgfSxcbiAge1xuICAgIFwiY29uc3RhbnRcIjogZmFsc2UsXG4gICAgXCJpbnB1dHNcIjogW10sXG4gICAgXCJuYW1lXCI6IFwic3RhcnRcIixcbiAgICBcIm91dHB1dHNcIjogW10sXG4gICAgXCJwYXlhYmxlXCI6IGZhbHNlLFxuICAgIFwic3RhdGVNdXRhYmlsaXR5XCI6IFwibm9ucGF5YWJsZVwiLFxuICAgIFwidHlwZVwiOiBcImZ1bmN0aW9uXCIsXG4gICAgXCJzaWduYXR1cmVcIjogXCIweGJlOWE2NTU1XCJcbiAgfSxcbiAge1xuICAgIFwiY29uc3RhbnRcIjogZmFsc2UsXG4gICAgXCJpbnB1dHNcIjogW1xuICAgICAge1xuICAgICAgICBcIm5hbWVcIjogXCJwbGF5ZXJcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlwiXG4gICAgICB9XG4gICAgXSxcbiAgICBcIm5hbWVcIjogXCJyZXZlYWxcIixcbiAgICBcIm91dHB1dHNcIjogW10sXG4gICAgXCJwYXlhYmxlXCI6IGZhbHNlLFxuICAgIFwic3RhdGVNdXRhYmlsaXR5XCI6IFwibm9ucGF5YWJsZVwiLFxuICAgIFwidHlwZVwiOiBcImZ1bmN0aW9uXCIsXG4gICAgXCJzaWduYXR1cmVcIjogXCIweGMyY2EwYWM1XCJcbiAgfSxcbiAge1xuICAgIFwiY29uc3RhbnRcIjogZmFsc2UsXG4gICAgXCJpbnB1dHNcIjogW1xuICAgICAge1xuICAgICAgICBcIm5hbWVcIjogXCJwbGF5ZXJcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm5hbWVcIjogXCJjb2x1bW5cIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlsyXVwiXG4gICAgICB9XG4gICAgXSxcbiAgICBcIm5hbWVcIjogXCJwbGFjZVwiLFxuICAgIFwib3V0cHV0c1wiOiBbXSxcbiAgICBcInBheWFibGVcIjogZmFsc2UsXG4gICAgXCJzdGF0ZU11dGFiaWxpdHlcIjogXCJub25wYXlhYmxlXCIsXG4gICAgXCJ0eXBlXCI6IFwiZnVuY3Rpb25cIixcbiAgICBcInNpZ25hdHVyZVwiOiBcIjB4ZjI4YmI5MzRcIlxuICB9LFxuICB7XG4gICAgXCJhbm9ueW1vdXNcIjogZmFsc2UsXG4gICAgXCJpbnB1dHNcIjogW1xuICAgICAge1xuICAgICAgICBcImluZGV4ZWRcIjogdHJ1ZSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX2dhbWVJZFwiLFxuICAgICAgICBcInR5cGVcIjogXCJ1aW50MjU2XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaW5kZXhlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX3BsYXllckFkZHJlc3NcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwiYWRkcmVzc1wiXG4gICAgICB9XG4gICAgXSxcbiAgICBcIm5hbWVcIjogXCJPbkpvaW5cIixcbiAgICBcInR5cGVcIjogXCJldmVudFwiLFxuICAgIFwic2lnbmF0dXJlXCI6IFwiMHg5N2RjMDY2NDU2NzE1OGE5YzE3MGQ1YjA4MmU3YWUyYTU4ZmFlMTBjM2UwN2YyY2ZiNmZiODZmZTZkY2ZiODhhXCJcbiAgfSxcbiAge1xuICAgIFwiYW5vbnltb3VzXCI6IGZhbHNlLFxuICAgIFwiaW5wdXRzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJpbmRleGVkXCI6IHRydWUsXG4gICAgICAgIFwibmFtZVwiOiBcIl9nYW1lSWRcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImluZGV4ZWRcIjogZmFsc2UsXG4gICAgICAgIFwibmFtZVwiOiBcIl9wbGF5ZXJBZGRyZXNzXCIsXG4gICAgICAgIFwidHlwZVwiOiBcImFkZHJlc3NcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpbmRleGVkXCI6IGZhbHNlLFxuICAgICAgICBcIm5hbWVcIjogXCJfcG9zaXRpb25cIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlsyXVwiXG4gICAgICB9XG4gICAgXSxcbiAgICBcIm5hbWVcIjogXCJPbk1vdmVcIixcbiAgICBcInR5cGVcIjogXCJldmVudFwiLFxuICAgIFwic2lnbmF0dXJlXCI6IFwiMHgxNzRmMTRhZmJhMDc2Yzc5NDc1MmQ0YWI1ZWRlOTVmNGFhMzUyZTQwMzY3ZDdkMzIxNDc3ZDdmZDUzMjc2MWZhXCJcbiAgfSxcbiAge1xuICAgIFwiYW5vbnltb3VzXCI6IGZhbHNlLFxuICAgIFwiaW5wdXRzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJpbmRleGVkXCI6IHRydWUsXG4gICAgICAgIFwibmFtZVwiOiBcIl9nYW1lSWRcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImluZGV4ZWRcIjogZmFsc2UsXG4gICAgICAgIFwibmFtZVwiOiBcIl9wbGF5ZXJBZGRyZXNzXCIsXG4gICAgICAgIFwidHlwZVwiOiBcImFkZHJlc3NcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpbmRleGVkXCI6IGZhbHNlLFxuICAgICAgICBcIm5hbWVcIjogXCJfcGxheWVyXCIsXG4gICAgICAgIFwidHlwZVwiOiBcInVpbnQyNTZcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpbmRleGVkXCI6IGZhbHNlLFxuICAgICAgICBcIm5hbWVcIjogXCJfcG9zaXRpb25cIixcbiAgICAgICAgXCJ0eXBlXCI6IFwidWludDI1NlsyXVwiXG4gICAgICB9XG4gICAgXSxcbiAgICBcIm5hbWVcIjogXCJPblBsYWNlXCIsXG4gICAgXCJ0eXBlXCI6IFwiZXZlbnRcIixcbiAgICBcInNpZ25hdHVyZVwiOiBcIjB4NzAyN2MxYmIzYjg0ODJiMmFlZmM5NDQ5ZTBjYzRhMzBiN2MxODBkZDdkM2I1ZjhiYWFkNGQ5Njg2ZDgzMDJhMlwiXG4gIH0sXG4gIHtcbiAgICBcImFub255bW91c1wiOiBmYWxzZSxcbiAgICBcImlucHV0c1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwiaW5kZXhlZFwiOiB0cnVlLFxuICAgICAgICBcIm5hbWVcIjogXCJfZ2FtZUlkXCIsXG4gICAgICAgIFwidHlwZVwiOiBcInVpbnQyNTZcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpbmRleGVkXCI6IGZhbHNlLFxuICAgICAgICBcIm5hbWVcIjogXCJfcGxheWVyQWRkcmVzc1wiLFxuICAgICAgICBcInR5cGVcIjogXCJhZGRyZXNzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaW5kZXhlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX3BsYXllclwiLFxuICAgICAgICBcInR5cGVcIjogXCJ1aW50MjU2XCJcbiAgICAgIH1cbiAgICBdLFxuICAgIFwibmFtZVwiOiBcIk9uUmV2ZWFsXCIsXG4gICAgXCJ0eXBlXCI6IFwiZXZlbnRcIixcbiAgICBcInNpZ25hdHVyZVwiOiBcIjB4ZDhmZTUxZGNmNGY2ZDJmOWVkZDg4NzgxYTJlZGE3ZGE4MTIwOTg2NzgyNWUxYWU5MzhmNzMxMDZhNjFjNGI5ZlwiXG4gIH1cbl0sXG4gICAgICAgIGFkZHJlc3M6ICcweGU0NGY0NzQ4NjA0NkUzOUEzRGZiZGI4NzY0RDE3MDA5YWE2NWE4ODUnXG4gICAgICB9XG4gICAgIiwiaW1wb3J0IGNvbGx1c2lvbiBmcm9tICcuLi9jb250cmFjdHMvY29sbHVzaW9uLnNvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHNldHVwR2FtZVN0YXRlKCkge1xuXHRjb25zb2xlLmxvZygnc2V0dGluZyB1cCB0aGUgZ2FtZSBzdGF0ZScpO1xuXHRnYW1lLmFkZHJlc3MgPSBjb2xsdXNpb24uYWRkcmVzcztcblx0Z2FtZS5jb250cmFjdCA9IGdldENvbnRyYWN0KCk7XG5cdC8vIGdhbWUuYmFsYW5jZSA9IGF3YWl0IGdldEJhbGFuY2UoKTtcblx0Ly8gZ2FtZS5pbmZvID0gYXdhaXQgZ2V0SW5mbygpO1xuXHRnYW1lLmN1cnJlbnRHYW1lSWQgPSBhd2FpdCBnZXRDdXJyZW50R2FtZUlkKCk7XG5cdGdhbWUucGFzdEV2ZW50cyA9IGF3YWl0IGdldFBhc3RFdmVudHMoKTtcblx0Z2FtZS5wbGF5ZXJBZGRyZXNzID0gYXdhaXQgd2ViMy5ldGguZ2V0Q29pbmJhc2UoKTtcblx0Z2FtZS5wbGF5ZXJzID0gW107XG5cdGdhbWUucG9zaXRpb25zID0gW107XG5cdGdhbWUuYWN0aW9uID0gJ21vdmUnO1xuXG5cdGNvbnNvbGUubG9nKCdwYXN0IGV2ZW50czonLCBnYW1lLnBhc3RFdmVudHMpO1xufVxuXG5mdW5jdGlvbiBnZXRDb250cmFjdCgpIHtcbiAgcmV0dXJuIG5ldyB3ZWIzLmV0aC5Db250cmFjdChjb2xsdXNpb24uaW50ZXJmYWNlLCBnYW1lLmFkZHJlc3MpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRCYWxhbmNlKCkge1xuXHRjb25zdCBiYWxhbmNlID0gYXdhaXQgd2ViMy5ldGguZ2V0QmFsYW5jZShnYW1lLmFkZHJlc3MpO1xuXG5cdHJldHVybiBiYWxhbmNlO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRJbmZvKCkge1xuXHQvLyByZXR1cm4gYXdhaXQgZ2FtZS5jb250cmFjdC5tZXRob2RzLmdldEluZm8oKS5jYWxsKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRHYW1lSWQoKSB7XG5cdHJldHVybiBhd2FpdCBnYW1lLmNvbnRyYWN0Lm1ldGhvZHMuY3VycmVudEdhbWVJZCgpLmNhbGwoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFzdEV2ZW50cygpIHtcblx0Y29uc3QgdG90YWxQbGF5ZXJzID0gYXdhaXQgZ2FtZS5jb250cmFjdC5tZXRob2RzLmdldFRvdGFsUGxheWVycygpLmNhbGwoKTtcblxuXHRjb25zb2xlLmxvZygndG90YWwgcGxheWVyczonLCB0b3RhbFBsYXllcnMpO1xuXHRjb25zb2xlLmxvZygnY3VycmVudCByb3VuZCBpZDonLCBnYW1lLmN1cnJlbnRHYW1lSWQpO1xuXG5cdGlmICh0b3RhbFBsYXllcnMgPiAzKSB7XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cdHJldHVybiBhd2FpdCBnYW1lLmNvbnRyYWN0LmdldFBhc3RFdmVudHMoXCJhbGxFdmVudHNcIiwge1xuXHQgICAgZnJvbUJsb2NrOiAwLFxuXHQgICAgdG9CbG9jazogJ2xhdGVzdCcsXG5cdCAgICBmaWx0ZXI6IHtcblx0ICAgIFx0X2dhbWVJZDogZ2FtZS5jdXJyZW50R2FtZUlkXG5cdCAgICB9XG5cdH0pO1xufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNi41JyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG4iLCJ2YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246IGNvcmUudmVyc2lvbixcbiAgbW9kZTogcmVxdWlyZSgnLi9fbGlicmFyeScpID8gJ3B1cmUnIDogJ2dsb2JhbCcsXG4gIGNvcHlyaWdodDogJ8KpIDIwMTkgRGVuaXMgUHVzaGthcmV2ICh6bG9pcm9jay5ydSknXG59KTtcbiIsInZhciBpZCA9IDA7XG52YXIgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59O1xuIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuIiwiLy8gNy4yLjggSXNSZWdFeHAoYXJndW1lbnQpXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBNQVRDSCA9IHJlcXVpcmUoJy4vX3drcycpKCdtYXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIGlzUmVnRXhwO1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmICgoaXNSZWdFeHAgPSBpdFtNQVRDSF0pICE9PSB1bmRlZmluZWQgPyAhIWlzUmVnRXhwIDogY29mKGl0KSA9PSAnUmVnRXhwJyk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gNy4zLjIwIFNwZWNpZXNDb25zdHJ1Y3RvcihPLCBkZWZhdWx0Q29uc3RydWN0b3IpXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBEKSB7XG4gIHZhciBDID0gYW5PYmplY3QoTykuY29uc3RydWN0b3I7XG4gIHZhciBTO1xuICByZXR1cm4gQyA9PT0gdW5kZWZpbmVkIHx8IChTID0gYW5PYmplY3QoQylbU1BFQ0lFU10pID09IHVuZGVmaW5lZCA/IEQgOiBhRnVuY3Rpb24oUyk7XG59O1xuIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG4iLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRPX1NUUklORykge1xuICByZXR1cm4gZnVuY3Rpb24gKHRoYXQsIHBvcykge1xuICAgIHZhciBzID0gU3RyaW5nKGRlZmluZWQodGhhdCkpO1xuICAgIHZhciBpID0gdG9JbnRlZ2VyKHBvcyk7XG4gICAgdmFyIGwgPSBzLmxlbmd0aDtcbiAgICB2YXIgYSwgYjtcbiAgICBpZiAoaSA8IDAgfHwgaSA+PSBsKSByZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhdCA9IHJlcXVpcmUoJy4vX3N0cmluZy1hdCcpKHRydWUpO1xuXG4gLy8gYEFkdmFuY2VTdHJpbmdJbmRleGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hZHZhbmNlc3RyaW5naW5kZXhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFMsIGluZGV4LCB1bmljb2RlKSB7XG4gIHJldHVybiBpbmRleCArICh1bmljb2RlID8gYXQoUywgaW5kZXgpLmxlbmd0aCA6IDEpO1xufTtcbiIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciBidWlsdGluRXhlYyA9IFJlZ0V4cC5wcm90b3R5cGUuZXhlYztcblxuIC8vIGBSZWdFeHBFeGVjYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cGV4ZWNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFIsIFMpIHtcbiAgdmFyIGV4ZWMgPSBSLmV4ZWM7XG4gIGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciByZXN1bHQgPSBleGVjLmNhbGwoUiwgUyk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWdFeHAgZXhlYyBtZXRob2QgcmV0dXJuZWQgc29tZXRoaW5nIG90aGVyIHRoYW4gYW4gT2JqZWN0IG9yIG51bGwnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBpZiAoY2xhc3NvZihSKSAhPT0gJ1JlZ0V4cCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWdFeHAjZXhlYyBjYWxsZWQgb24gaW5jb21wYXRpYmxlIHJlY2VpdmVyJyk7XG4gIH1cbiAgcmV0dXJuIGJ1aWx0aW5FeGVjLmNhbGwoUiwgUyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMjEuMi41LjMgZ2V0IFJlZ0V4cC5wcm90b3R5cGUuZmxhZ3NcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0aGF0ID0gYW5PYmplY3QodGhpcyk7XG4gIHZhciByZXN1bHQgPSAnJztcbiAgaWYgKHRoYXQuZ2xvYmFsKSByZXN1bHQgKz0gJ2cnO1xuICBpZiAodGhhdC5pZ25vcmVDYXNlKSByZXN1bHQgKz0gJ2knO1xuICBpZiAodGhhdC5tdWx0aWxpbmUpIHJlc3VsdCArPSAnbSc7XG4gIGlmICh0aGF0LnVuaWNvZGUpIHJlc3VsdCArPSAndSc7XG4gIGlmICh0aGF0LnN0aWNreSkgcmVzdWx0ICs9ICd5JztcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZWdleHBGbGFncyA9IHJlcXVpcmUoJy4vX2ZsYWdzJyk7XG5cbnZhciBuYXRpdmVFeGVjID0gUmVnRXhwLnByb3RvdHlwZS5leGVjO1xuLy8gVGhpcyBhbHdheXMgcmVmZXJzIHRvIHRoZSBuYXRpdmUgaW1wbGVtZW50YXRpb24sIGJlY2F1c2UgdGhlXG4vLyBTdHJpbmcjcmVwbGFjZSBwb2x5ZmlsbCB1c2VzIC4vZml4LXJlZ2V4cC13ZWxsLWtub3duLXN5bWJvbC1sb2dpYy5qcyxcbi8vIHdoaWNoIGxvYWRzIHRoaXMgZmlsZSBiZWZvcmUgcGF0Y2hpbmcgdGhlIG1ldGhvZC5cbnZhciBuYXRpdmVSZXBsYWNlID0gU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlO1xuXG52YXIgcGF0Y2hlZEV4ZWMgPSBuYXRpdmVFeGVjO1xuXG52YXIgTEFTVF9JTkRFWCA9ICdsYXN0SW5kZXgnO1xuXG52YXIgVVBEQVRFU19MQVNUX0lOREVYX1dST05HID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlMSA9IC9hLyxcbiAgICAgIHJlMiA9IC9iKi9nO1xuICBuYXRpdmVFeGVjLmNhbGwocmUxLCAnYScpO1xuICBuYXRpdmVFeGVjLmNhbGwocmUyLCAnYScpO1xuICByZXR1cm4gcmUxW0xBU1RfSU5ERVhdICE9PSAwIHx8IHJlMltMQVNUX0lOREVYXSAhPT0gMDtcbn0pKCk7XG5cbi8vIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwLCBjb3BpZWQgZnJvbSBlczUtc2hpbSdzIFN0cmluZyNzcGxpdCBwYXRjaC5cbnZhciBOUENHX0lOQ0xVREVEID0gLygpPz8vLmV4ZWMoJycpWzFdICE9PSB1bmRlZmluZWQ7XG5cbnZhciBQQVRDSCA9IFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORyB8fCBOUENHX0lOQ0xVREVEO1xuXG5pZiAoUEFUQ0gpIHtcbiAgcGF0Y2hlZEV4ZWMgPSBmdW5jdGlvbiBleGVjKHN0cikge1xuICAgIHZhciByZSA9IHRoaXM7XG4gICAgdmFyIGxhc3RJbmRleCwgcmVDb3B5LCBtYXRjaCwgaTtcblxuICAgIGlmIChOUENHX0lOQ0xVREVEKSB7XG4gICAgICByZUNvcHkgPSBuZXcgUmVnRXhwKCdeJyArIHJlLnNvdXJjZSArICckKD8hXFxcXHMpJywgcmVnZXhwRmxhZ3MuY2FsbChyZSkpO1xuICAgIH1cbiAgICBpZiAoVVBEQVRFU19MQVNUX0lOREVYX1dST05HKSBsYXN0SW5kZXggPSByZVtMQVNUX0lOREVYXTtcblxuICAgIG1hdGNoID0gbmF0aXZlRXhlYy5jYWxsKHJlLCBzdHIpO1xuXG4gICAgaWYgKFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORyAmJiBtYXRjaCkge1xuICAgICAgcmVbTEFTVF9JTkRFWF0gPSByZS5nbG9iYWwgPyBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCA6IGxhc3RJbmRleDtcbiAgICB9XG4gICAgaWYgKE5QQ0dfSU5DTFVERUQgJiYgbWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGBcbiAgICAgIC8vIGZvciBOUENHLCBsaWtlIElFOC4gTk9URTogVGhpcyBkb2Vzbicgd29yayBmb3IgLyguPyk/L1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWxvb3AtZnVuY1xuICAgICAgbmF0aXZlUmVwbGFjZS5jYWxsKG1hdGNoWzBdLCByZUNvcHksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZmluZWQpIG1hdGNoW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGF0Y2hlZEV4ZWM7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG4iLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ25hdGl2ZS1mdW5jdGlvbi10by1zdHJpbmcnLCBGdW5jdGlvbi50b1N0cmluZyk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBTUkMgPSByZXF1aXJlKCcuL191aWQnKSgnc3JjJyk7XG52YXIgJHRvU3RyaW5nID0gcmVxdWlyZSgnLi9fZnVuY3Rpb24tdG8tc3RyaW5nJyk7XG52YXIgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJztcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWwsIHNhZmUpIHtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmIChPW2tleV0gPT09IHZhbCkgcmV0dXJuO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoIXNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9IGVsc2UgaWYgKE9ba2V5XSkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgY3R4ID0gcmVxdWlyZSgnLi9fY3R4Jyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciB0YXJnZXQgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV07XG4gIHZhciBleHBvcnRzID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIHZhciBleHBQcm90byA9IGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pO1xuICB2YXIga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZiAoSVNfR0xPQkFMKSBzb3VyY2UgPSBuYW1lO1xuICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZiAodGFyZ2V0KSByZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZiAoZXhwb3J0c1trZXldICE9IG91dCkgaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYgKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KSBleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlZ2V4cEV4ZWMgPSByZXF1aXJlKCcuL19yZWdleHAtZXhlYycpO1xucmVxdWlyZSgnLi9fZXhwb3J0Jykoe1xuICB0YXJnZXQ6ICdSZWdFeHAnLFxuICBwcm90bzogdHJ1ZSxcbiAgZm9yY2VkOiByZWdleHBFeGVjICE9PSAvLi8uZXhlY1xufSwge1xuICBleGVjOiByZWdleHBFeGVjXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnJlcXVpcmUoJy4vZXM2LnJlZ2V4cC5leGVjJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG52YXIgd2tzID0gcmVxdWlyZSgnLi9fd2tzJyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjJyk7XG5cbnZhciBTUEVDSUVTID0gd2tzKCdzcGVjaWVzJyk7XG5cbnZhciBSRVBMQUNFX1NVUFBPUlRTX05BTUVEX0dST1VQUyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vICNyZXBsYWNlIG5lZWRzIGJ1aWx0LWluIHN1cHBvcnQgZm9yIG5hbWVkIGdyb3Vwcy5cbiAgLy8gI21hdGNoIHdvcmtzIGZpbmUgYmVjYXVzZSBpdCBqdXN0IHJldHVybiB0aGUgZXhlYyByZXN1bHRzLCBldmVuIGlmIGl0IGhhc1xuICAvLyBhIFwiZ3JvcHNcIiBwcm9wZXJ0eS5cbiAgdmFyIHJlID0gLy4vO1xuICByZS5leGVjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICByZXN1bHQuZ3JvdXBzID0geyBhOiAnNycgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICByZXR1cm4gJycucmVwbGFjZShyZSwgJyQ8YT4nKSAhPT0gJzcnO1xufSk7XG5cbnZhciBTUExJVF9XT1JLU19XSVRIX09WRVJXUklUVEVOX0VYRUMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBDaHJvbWUgNTEgaGFzIGEgYnVnZ3kgXCJzcGxpdFwiIGltcGxlbWVudGF0aW9uIHdoZW4gUmVnRXhwI2V4ZWMgIT09IG5hdGl2ZUV4ZWNcbiAgdmFyIHJlID0gLyg/OikvO1xuICB2YXIgb3JpZ2luYWxFeGVjID0gcmUuZXhlYztcbiAgcmUuZXhlYyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9yaWdpbmFsRXhlYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICB2YXIgcmVzdWx0ID0gJ2FiJy5zcGxpdChyZSk7XG4gIHJldHVybiByZXN1bHQubGVuZ3RoID09PSAyICYmIHJlc3VsdFswXSA9PT0gJ2EnICYmIHJlc3VsdFsxXSA9PT0gJ2InO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoS0VZLCBsZW5ndGgsIGV4ZWMpIHtcbiAgdmFyIFNZTUJPTCA9IHdrcyhLRVkpO1xuXG4gIHZhciBERUxFR0FURVNfVE9fU1lNQk9MID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTdHJpbmcgbWV0aG9kcyBjYWxsIHN5bWJvbC1uYW1lZCBSZWdFcCBtZXRob2RzXG4gICAgdmFyIE8gPSB7fTtcbiAgICBPW1NZTUJPTF0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9O1xuICAgIHJldHVybiAnJ1tLRVldKE8pICE9IDc7XG4gIH0pO1xuXG4gIHZhciBERUxFR0FURVNfVE9fRVhFQyA9IERFTEVHQVRFU19UT19TWU1CT0wgPyAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIFN5bWJvbC1uYW1lZCBSZWdFeHAgbWV0aG9kcyBjYWxsIC5leGVjXG4gICAgdmFyIGV4ZWNDYWxsZWQgPSBmYWxzZTtcbiAgICB2YXIgcmUgPSAvYS87XG4gICAgcmUuZXhlYyA9IGZ1bmN0aW9uICgpIHsgZXhlY0NhbGxlZCA9IHRydWU7IHJldHVybiBudWxsOyB9O1xuICAgIGlmIChLRVkgPT09ICdzcGxpdCcpIHtcbiAgICAgIC8vIFJlZ0V4cFtAQHNwbGl0XSBkb2Vzbid0IGNhbGwgdGhlIHJlZ2V4J3MgZXhlYyBtZXRob2QsIGJ1dCBmaXJzdCBjcmVhdGVzXG4gICAgICAvLyBhIG5ldyBvbmUuIFdlIG5lZWQgdG8gcmV0dXJuIHRoZSBwYXRjaGVkIHJlZ2V4IHdoZW4gY3JlYXRpbmcgdGhlIG5ldyBvbmUuXG4gICAgICByZS5jb25zdHJ1Y3RvciA9IHt9O1xuICAgICAgcmUuY29uc3RydWN0b3JbU1BFQ0lFU10gPSBmdW5jdGlvbiAoKSB7IHJldHVybiByZTsgfTtcbiAgICB9XG4gICAgcmVbU1lNQk9MXSgnJyk7XG4gICAgcmV0dXJuICFleGVjQ2FsbGVkO1xuICB9KSA6IHVuZGVmaW5lZDtcblxuICBpZiAoXG4gICAgIURFTEVHQVRFU19UT19TWU1CT0wgfHxcbiAgICAhREVMRUdBVEVTX1RPX0VYRUMgfHxcbiAgICAoS0VZID09PSAncmVwbGFjZScgJiYgIVJFUExBQ0VfU1VQUE9SVFNfTkFNRURfR1JPVVBTKSB8fFxuICAgIChLRVkgPT09ICdzcGxpdCcgJiYgIVNQTElUX1dPUktTX1dJVEhfT1ZFUldSSVRURU5fRVhFQylcbiAgKSB7XG4gICAgdmFyIG5hdGl2ZVJlZ0V4cE1ldGhvZCA9IC8uL1tTWU1CT0xdO1xuICAgIHZhciBmbnMgPSBleGVjKFxuICAgICAgZGVmaW5lZCxcbiAgICAgIFNZTUJPTCxcbiAgICAgICcnW0tFWV0sXG4gICAgICBmdW5jdGlvbiBtYXliZUNhbGxOYXRpdmUobmF0aXZlTWV0aG9kLCByZWdleHAsIHN0ciwgYXJnMiwgZm9yY2VTdHJpbmdNZXRob2QpIHtcbiAgICAgICAgaWYgKHJlZ2V4cC5leGVjID09PSByZWdleHBFeGVjKSB7XG4gICAgICAgICAgaWYgKERFTEVHQVRFU19UT19TWU1CT0wgJiYgIWZvcmNlU3RyaW5nTWV0aG9kKSB7XG4gICAgICAgICAgICAvLyBUaGUgbmF0aXZlIFN0cmluZyBtZXRob2QgYWxyZWFkeSBkZWxlZ2F0ZXMgdG8gQEBtZXRob2QgKHRoaXNcbiAgICAgICAgICAgIC8vIHBvbHlmaWxsZWQgZnVuY3Rpb24pLCBsZWFzaW5nIHRvIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgICAgICAgICAgIC8vIFdlIGF2b2lkIGl0IGJ5IGRpcmVjdGx5IGNhbGxpbmcgdGhlIG5hdGl2ZSBAQG1ldGhvZCBtZXRob2QuXG4gICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbmF0aXZlUmVnRXhwTWV0aG9kLmNhbGwocmVnZXhwLCBzdHIsIGFyZzIpIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBuYXRpdmVNZXRob2QuY2FsbChzdHIsIHJlZ2V4cCwgYXJnMikgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBkb25lOiBmYWxzZSB9O1xuICAgICAgfVxuICAgICk7XG4gICAgdmFyIHN0cmZuID0gZm5zWzBdO1xuICAgIHZhciByeGZuID0gZm5zWzFdO1xuXG4gICAgcmVkZWZpbmUoU3RyaW5nLnByb3RvdHlwZSwgS0VZLCBzdHJmbik7XG4gICAgaGlkZShSZWdFeHAucHJvdG90eXBlLCBTWU1CT0wsIGxlbmd0aCA9PSAyXG4gICAgICAvLyAyMS4yLjUuOCBSZWdFeHAucHJvdG90eXBlW0BAcmVwbGFjZV0oc3RyaW5nLCByZXBsYWNlVmFsdWUpXG4gICAgICAvLyAyMS4yLjUuMTEgUmVnRXhwLnByb3RvdHlwZVtAQHNwbGl0XShzdHJpbmcsIGxpbWl0KVxuICAgICAgPyBmdW5jdGlvbiAoc3RyaW5nLCBhcmcpIHsgcmV0dXJuIHJ4Zm4uY2FsbChzdHJpbmcsIHRoaXMsIGFyZyk7IH1cbiAgICAgIC8vIDIxLjIuNS42IFJlZ0V4cC5wcm90b3R5cGVbQEBtYXRjaF0oc3RyaW5nKVxuICAgICAgLy8gMjEuMi41LjkgUmVnRXhwLnByb3RvdHlwZVtAQHNlYXJjaF0oc3RyaW5nKVxuICAgICAgOiBmdW5jdGlvbiAoc3RyaW5nKSB7IHJldHVybiByeGZuLmNhbGwoc3RyaW5nLCB0aGlzKTsgfVxuICAgICk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc1JlZ0V4cCA9IHJlcXVpcmUoJy4vX2lzLXJlZ2V4cCcpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fc3BlY2llcy1jb25zdHJ1Y3RvcicpO1xudmFyIGFkdmFuY2VTdHJpbmdJbmRleCA9IHJlcXVpcmUoJy4vX2FkdmFuY2Utc3RyaW5nLWluZGV4Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciBjYWxsUmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjLWFic3RyYWN0Jyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyICRtaW4gPSBNYXRoLm1pbjtcbnZhciAkcHVzaCA9IFtdLnB1c2g7XG52YXIgJFNQTElUID0gJ3NwbGl0JztcbnZhciBMRU5HVEggPSAnbGVuZ3RoJztcbnZhciBMQVNUX0lOREVYID0gJ2xhc3RJbmRleCc7XG52YXIgTUFYX1VJTlQzMiA9IDB4ZmZmZmZmZmY7XG5cbi8vIGJhYmVsLW1pbmlmeSB0cmFuc3BpbGVzIFJlZ0V4cCgneCcsICd5JykgLT4gL3gveSBhbmQgaXQgY2F1c2VzIFN5bnRheEVycm9yXG52YXIgU1VQUE9SVFNfWSA9ICFmYWlscyhmdW5jdGlvbiAoKSB7IFJlZ0V4cChNQVhfVUlOVDMyLCAneScpOyB9KTtcblxuLy8gQEBzcGxpdCBsb2dpY1xucmVxdWlyZSgnLi9fZml4LXJlLXdrcycpKCdzcGxpdCcsIDIsIGZ1bmN0aW9uIChkZWZpbmVkLCBTUExJVCwgJHNwbGl0LCBtYXliZUNhbGxOYXRpdmUpIHtcbiAgdmFyIGludGVybmFsU3BsaXQ7XG4gIGlmIChcbiAgICAnYWJiYydbJFNQTElUXSgvKGIpKi8pWzFdID09ICdjJyB8fFxuICAgICd0ZXN0J1skU1BMSVRdKC8oPzopLywgLTEpW0xFTkdUSF0gIT0gNCB8fFxuICAgICdhYidbJFNQTElUXSgvKD86YWIpKi8pW0xFTkdUSF0gIT0gMiB8fFxuICAgICcuJ1skU1BMSVRdKC8oLj8pKC4/KS8pW0xFTkdUSF0gIT0gNCB8fFxuICAgICcuJ1skU1BMSVRdKC8oKSgpLylbTEVOR1RIXSA+IDEgfHxcbiAgICAnJ1skU1BMSVRdKC8uPy8pW0xFTkdUSF1cbiAgKSB7XG4gICAgLy8gYmFzZWQgb24gZXM1LXNoaW0gaW1wbGVtZW50YXRpb24sIG5lZWQgdG8gcmV3b3JrIGl0XG4gICAgaW50ZXJuYWxTcGxpdCA9IGZ1bmN0aW9uIChzZXBhcmF0b3IsIGxpbWl0KSB7XG4gICAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgICAgaWYgKHNlcGFyYXRvciA9PT0gdW5kZWZpbmVkICYmIGxpbWl0ID09PSAwKSByZXR1cm4gW107XG4gICAgICAvLyBJZiBgc2VwYXJhdG9yYCBpcyBub3QgYSByZWdleCwgdXNlIG5hdGl2ZSBzcGxpdFxuICAgICAgaWYgKCFpc1JlZ0V4cChzZXBhcmF0b3IpKSByZXR1cm4gJHNwbGl0LmNhbGwoc3RyaW5nLCBzZXBhcmF0b3IsIGxpbWl0KTtcbiAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgIHZhciBmbGFncyA9IChzZXBhcmF0b3IuaWdub3JlQ2FzZSA/ICdpJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAoc2VwYXJhdG9yLm11bHRpbGluZSA/ICdtJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAoc2VwYXJhdG9yLnVuaWNvZGUgPyAndScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHNlcGFyYXRvci5zdGlja3kgPyAneScgOiAnJyk7XG4gICAgICB2YXIgbGFzdExhc3RJbmRleCA9IDA7XG4gICAgICB2YXIgc3BsaXRMaW1pdCA9IGxpbWl0ID09PSB1bmRlZmluZWQgPyBNQVhfVUlOVDMyIDogbGltaXQgPj4+IDA7XG4gICAgICAvLyBNYWtlIGBnbG9iYWxgIGFuZCBhdm9pZCBgbGFzdEluZGV4YCBpc3N1ZXMgYnkgd29ya2luZyB3aXRoIGEgY29weVxuICAgICAgdmFyIHNlcGFyYXRvckNvcHkgPSBuZXcgUmVnRXhwKHNlcGFyYXRvci5zb3VyY2UsIGZsYWdzICsgJ2cnKTtcbiAgICAgIHZhciBtYXRjaCwgbGFzdEluZGV4LCBsYXN0TGVuZ3RoO1xuICAgICAgd2hpbGUgKG1hdGNoID0gcmVnZXhwRXhlYy5jYWxsKHNlcGFyYXRvckNvcHksIHN0cmluZykpIHtcbiAgICAgICAgbGFzdEluZGV4ID0gc2VwYXJhdG9yQ29weVtMQVNUX0lOREVYXTtcbiAgICAgICAgaWYgKGxhc3RJbmRleCA+IGxhc3RMYXN0SW5kZXgpIHtcbiAgICAgICAgICBvdXRwdXQucHVzaChzdHJpbmcuc2xpY2UobGFzdExhc3RJbmRleCwgbWF0Y2guaW5kZXgpKTtcbiAgICAgICAgICBpZiAobWF0Y2hbTEVOR1RIXSA+IDEgJiYgbWF0Y2guaW5kZXggPCBzdHJpbmdbTEVOR1RIXSkgJHB1c2guYXBwbHkob3V0cHV0LCBtYXRjaC5zbGljZSgxKSk7XG4gICAgICAgICAgbGFzdExlbmd0aCA9IG1hdGNoWzBdW0xFTkdUSF07XG4gICAgICAgICAgbGFzdExhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgICAgICBpZiAob3V0cHV0W0xFTkdUSF0gPj0gc3BsaXRMaW1pdCkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlcGFyYXRvckNvcHlbTEFTVF9JTkRFWF0gPT09IG1hdGNoLmluZGV4KSBzZXBhcmF0b3JDb3B5W0xBU1RfSU5ERVhdKys7IC8vIEF2b2lkIGFuIGluZmluaXRlIGxvb3BcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0TGFzdEluZGV4ID09PSBzdHJpbmdbTEVOR1RIXSkge1xuICAgICAgICBpZiAobGFzdExlbmd0aCB8fCAhc2VwYXJhdG9yQ29weS50ZXN0KCcnKSkgb3V0cHV0LnB1c2goJycpO1xuICAgICAgfSBlbHNlIG91dHB1dC5wdXNoKHN0cmluZy5zbGljZShsYXN0TGFzdEluZGV4KSk7XG4gICAgICByZXR1cm4gb3V0cHV0W0xFTkdUSF0gPiBzcGxpdExpbWl0ID8gb3V0cHV0LnNsaWNlKDAsIHNwbGl0TGltaXQpIDogb3V0cHV0O1xuICAgIH07XG4gIC8vIENoYWtyYSwgVjhcbiAgfSBlbHNlIGlmICgnMCdbJFNQTElUXSh1bmRlZmluZWQsIDApW0xFTkdUSF0pIHtcbiAgICBpbnRlcm5hbFNwbGl0ID0gZnVuY3Rpb24gKHNlcGFyYXRvciwgbGltaXQpIHtcbiAgICAgIHJldHVybiBzZXBhcmF0b3IgPT09IHVuZGVmaW5lZCAmJiBsaW1pdCA9PT0gMCA/IFtdIDogJHNwbGl0LmNhbGwodGhpcywgc2VwYXJhdG9yLCBsaW1pdCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBpbnRlcm5hbFNwbGl0ID0gJHNwbGl0O1xuICB9XG5cbiAgcmV0dXJuIFtcbiAgICAvLyBgU3RyaW5nLnByb3RvdHlwZS5zcGxpdGAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5zcGxpdFxuICAgIGZ1bmN0aW9uIHNwbGl0KHNlcGFyYXRvciwgbGltaXQpIHtcbiAgICAgIHZhciBPID0gZGVmaW5lZCh0aGlzKTtcbiAgICAgIHZhciBzcGxpdHRlciA9IHNlcGFyYXRvciA9PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzZXBhcmF0b3JbU1BMSVRdO1xuICAgICAgcmV0dXJuIHNwbGl0dGVyICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBzcGxpdHRlci5jYWxsKHNlcGFyYXRvciwgTywgbGltaXQpXG4gICAgICAgIDogaW50ZXJuYWxTcGxpdC5jYWxsKFN0cmluZyhPKSwgc2VwYXJhdG9yLCBsaW1pdCk7XG4gICAgfSxcbiAgICAvLyBgUmVnRXhwLnByb3RvdHlwZVtAQHNwbGl0XWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwLnByb3RvdHlwZS1AQHNwbGl0XG4gICAgLy9cbiAgICAvLyBOT1RFOiBUaGlzIGNhbm5vdCBiZSBwcm9wZXJseSBwb2x5ZmlsbGVkIGluIGVuZ2luZXMgdGhhdCBkb24ndCBzdXBwb3J0XG4gICAgLy8gdGhlICd5JyBmbGFnLlxuICAgIGZ1bmN0aW9uIChyZWdleHAsIGxpbWl0KSB7XG4gICAgICB2YXIgcmVzID0gbWF5YmVDYWxsTmF0aXZlKGludGVybmFsU3BsaXQsIHJlZ2V4cCwgdGhpcywgbGltaXQsIGludGVybmFsU3BsaXQgIT09ICRzcGxpdCk7XG4gICAgICBpZiAocmVzLmRvbmUpIHJldHVybiByZXMudmFsdWU7XG5cbiAgICAgIHZhciByeCA9IGFuT2JqZWN0KHJlZ2V4cCk7XG4gICAgICB2YXIgUyA9IFN0cmluZyh0aGlzKTtcbiAgICAgIHZhciBDID0gc3BlY2llc0NvbnN0cnVjdG9yKHJ4LCBSZWdFeHApO1xuXG4gICAgICB2YXIgdW5pY29kZU1hdGNoaW5nID0gcngudW5pY29kZTtcbiAgICAgIHZhciBmbGFncyA9IChyeC5pZ25vcmVDYXNlID8gJ2knIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyeC5tdWx0aWxpbmUgPyAnbScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJ4LnVuaWNvZGUgPyAndScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKFNVUFBPUlRTX1kgPyAneScgOiAnZycpO1xuXG4gICAgICAvLyBeKD8gKyByeCArICkgaXMgbmVlZGVkLCBpbiBjb21iaW5hdGlvbiB3aXRoIHNvbWUgUyBzbGljaW5nLCB0b1xuICAgICAgLy8gc2ltdWxhdGUgdGhlICd5JyBmbGFnLlxuICAgICAgdmFyIHNwbGl0dGVyID0gbmV3IEMoU1VQUE9SVFNfWSA/IHJ4IDogJ14oPzonICsgcnguc291cmNlICsgJyknLCBmbGFncyk7XG4gICAgICB2YXIgbGltID0gbGltaXQgPT09IHVuZGVmaW5lZCA/IE1BWF9VSU5UMzIgOiBsaW1pdCA+Pj4gMDtcbiAgICAgIGlmIChsaW0gPT09IDApIHJldHVybiBbXTtcbiAgICAgIGlmIChTLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGNhbGxSZWdFeHBFeGVjKHNwbGl0dGVyLCBTKSA9PT0gbnVsbCA/IFtTXSA6IFtdO1xuICAgICAgdmFyIHAgPSAwO1xuICAgICAgdmFyIHEgPSAwO1xuICAgICAgdmFyIEEgPSBbXTtcbiAgICAgIHdoaWxlIChxIDwgUy5sZW5ndGgpIHtcbiAgICAgICAgc3BsaXR0ZXIubGFzdEluZGV4ID0gU1VQUE9SVFNfWSA/IHEgOiAwO1xuICAgICAgICB2YXIgeiA9IGNhbGxSZWdFeHBFeGVjKHNwbGl0dGVyLCBTVVBQT1JUU19ZID8gUyA6IFMuc2xpY2UocSkpO1xuICAgICAgICB2YXIgZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHogPT09IG51bGwgfHxcbiAgICAgICAgICAoZSA9ICRtaW4odG9MZW5ndGgoc3BsaXR0ZXIubGFzdEluZGV4ICsgKFNVUFBPUlRTX1kgPyAwIDogcSkpLCBTLmxlbmd0aCkpID09PSBwXG4gICAgICAgICkge1xuICAgICAgICAgIHEgPSBhZHZhbmNlU3RyaW5nSW5kZXgoUywgcSwgdW5pY29kZU1hdGNoaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBBLnB1c2goUy5zbGljZShwLCBxKSk7XG4gICAgICAgICAgaWYgKEEubGVuZ3RoID09PSBsaW0pIHJldHVybiBBO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IHoubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICBBLnB1c2goeltpXSk7XG4gICAgICAgICAgICBpZiAoQS5sZW5ndGggPT09IGxpbSkgcmV0dXJuIEE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHEgPSBwID0gZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgQS5wdXNoKFMuc2xpY2UocCkpO1xuICAgICAgcmV0dXJuIEE7XG4gICAgfVxuICBdO1xufSk7XG4iLCIvLyAyMS4yLjUuMyBnZXQgUmVnRXhwLnByb3RvdHlwZS5mbGFncygpXG5pZiAocmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAvLi9nLmZsYWdzICE9ICdnJykgcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZihSZWdFeHAucHJvdG90eXBlLCAnZmxhZ3MnLCB7XG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgZ2V0OiByZXF1aXJlKCcuL19mbGFncycpXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnJlcXVpcmUoJy4vZXM2LnJlZ2V4cC5mbGFncycpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgJGZsYWdzID0gcmVxdWlyZSgnLi9fZmxhZ3MnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJztcbnZhciAkdG9TdHJpbmcgPSAvLi9bVE9fU1RSSU5HXTtcblxudmFyIGRlZmluZSA9IGZ1bmN0aW9uIChmbikge1xuICByZXF1aXJlKCcuL19yZWRlZmluZScpKFJlZ0V4cC5wcm90b3R5cGUsIFRPX1NUUklORywgZm4sIHRydWUpO1xufTtcblxuLy8gMjEuMi41LjE0IFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcoKVxuaWYgKHJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkgeyByZXR1cm4gJHRvU3RyaW5nLmNhbGwoeyBzb3VyY2U6ICdhJywgZmxhZ3M6ICdiJyB9KSAhPSAnL2EvYic7IH0pKSB7XG4gIGRlZmluZShmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICB2YXIgUiA9IGFuT2JqZWN0KHRoaXMpO1xuICAgIHJldHVybiAnLycuY29uY2F0KFIuc291cmNlLCAnLycsXG4gICAgICAnZmxhZ3MnIGluIFIgPyBSLmZsYWdzIDogIURFU0NSSVBUT1JTICYmIFIgaW5zdGFuY2VvZiBSZWdFeHAgPyAkZmxhZ3MuY2FsbChSKSA6IHVuZGVmaW5lZCk7XG4gIH0pO1xuLy8gRkY0NC0gUmVnRXhwI3RvU3RyaW5nIGhhcyBhIHdyb25nIG5hbWVcbn0gZWxzZSBpZiAoJHRvU3RyaW5nLm5hbWUgIT0gVE9fU1RSSU5HKSB7XG4gIGRlZmluZShmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJHRvU3RyaW5nLmNhbGwodGhpcyk7XG4gIH0pO1xufVxuIiwiZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fd2tzJyk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmIChuYW1lLmNoYXJBdCgwKSAhPSAnXycgJiYgIShuYW1lIGluICRTeW1ib2wpKSBkZWZpbmVQcm9wZXJ0eSgkU3ltYm9sLCBuYW1lLCB7IHZhbHVlOiB3a3NFeHQuZihuYW1lKSB9KTtcbn07XG4iLCJyZXF1aXJlKCcuL193a3MtZGVmaW5lJykoJ2FzeW5jSXRlcmF0b3InKTtcbiIsInZhciBNRVRBID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHNldERlc2MgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGlkID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGlzRXh0ZW5zaWJsZShPYmplY3QucHJldmVudEV4dGVuc2lvbnMoe30pKTtcbn0pO1xudmFyIHNldE1ldGEgPSBmdW5jdGlvbiAoaXQpIHtcbiAgc2V0RGVzYyhpdCwgTUVUQSwgeyB2YWx1ZToge1xuICAgIGk6ICdPJyArICsraWQsIC8vIG9iamVjdCBJRFxuICAgIHc6IHt9ICAgICAgICAgIC8vIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gfSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKSBzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogTUVUQSxcbiAgTkVFRDogZmFsc2UsXG4gIGZhc3RLZXk6IGZhc3RLZXksXG4gIGdldFdlYWs6IGdldFdlYWssXG4gIG9uRnJlZXplOiBvbkZyZWV6ZVxufTtcbiIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgdGFnLCBzdGF0KSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSBkZWYoaXQsIFRBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWcgfSk7XG59O1xuIiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcbiIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTtcbiIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gcmVxdWlyZSgnLi9fdG8tYWJzb2x1dGUtaW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKElTX0lOQ0xVREVTKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGVsLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgTyA9IHRvSU9iamVjdCgkdGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSB0b0Fic29sdXRlSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpO1xuICAgIHZhciB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgIGlmIChJU19JTkNMVURFUyAmJiBlbCAhPSBlbCkgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSB7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICBpZiAodmFsdWUgIT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I2luZGV4T2YgaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSB7XG4gICAgICBpZiAoT1tpbmRleF0gPT09IGVsKSByZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59O1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCdrZXlzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSBpZiAoa2V5ICE9IElFX1BST1RPKSBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuIiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGdldEtleXMoaXQpO1xuICB2YXIgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYgKGdldFN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpO1xuICAgIHZhciBpc0VudW0gPSBwSUUuZjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGtleTtcbiAgICB3aGlsZSAoc3ltYm9scy5sZW5ndGggPiBpKSBpZiAoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcbiIsInZhciBkUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICB2YXIga2V5cyA9IGdldEtleXMoUHJvcGVydGllcyk7XG4gIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB2YXIgUDtcbiAgd2hpbGUgKGxlbmd0aCA+IGkpIGRQLmYoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XG4gIHJldHVybiBPO1xufTtcbiIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4iLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGRQcyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG4iLCIvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJykuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gJGtleXMoTywgaGlkZGVuS2V5cyk7XG59O1xuIiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciBnT1BOID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mO1xudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbnZhciB3aW5kb3dOYW1lcyA9IHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgd2luZG93ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ09QTihpdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZiA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpIHtcbiAgcmV0dXJuIHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nID8gZ2V0V2luZG93TmFtZXMoaXQpIDogZ09QTih0b0lPYmplY3QoaXQpKTtcbn07XG4iLCJ2YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBnT1BEKE8sIFApO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKGhhcyhPLCBQKSkgcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBNRVRBID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWTtcbnZhciAkZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciB3a3MgPSByZXF1aXJlKCcuL193a3MnKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgd2tzRGVmaW5lID0gcmVxdWlyZSgnLi9fd2tzLWRlZmluZScpO1xudmFyIGVudW1LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1rZXlzJyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKTtcbnZhciBnT1BORXh0ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4tZXh0Jyk7XG52YXIgJEdPUEQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpO1xudmFyICREUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BEID0gJEdPUEQuZjtcbnZhciBkUCA9ICREUC5mO1xudmFyIGdPUE4gPSBnT1BORXh0LmY7XG52YXIgJFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG52YXIgJEpTT04gPSBnbG9iYWwuSlNPTjtcbnZhciBfc3RyaW5naWZ5ID0gJEpTT04gJiYgJEpTT04uc3RyaW5naWZ5O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEhJRERFTiA9IHdrcygnX2hpZGRlbicpO1xudmFyIFRPX1BSSU1JVElWRSA9IHdrcygndG9QcmltaXRpdmUnKTtcbnZhciBpc0VudW0gPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5Jyk7XG52YXIgQWxsU3ltYm9scyA9IHNoYXJlZCgnc3ltYm9scycpO1xudmFyIE9QU3ltYm9scyA9IHNoYXJlZCgnb3Atc3ltYm9scycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0W1BST1RPVFlQRV07XG52YXIgVVNFX05BVElWRSA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbic7XG52YXIgUU9iamVjdCA9IGdsb2JhbC5RT2JqZWN0O1xuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG52YXIgc2V0dGVyID0gIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRQKHRoaXMsICdhJywgeyB2YWx1ZTogNyB9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uIChpdCwga2V5LCBEKSB7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZiAocHJvdG9EZXNjKSBkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmIChwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKSBkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpIHtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90bykgJGRlZmluZVByb3BlcnR5KE9QU3ltYm9scywga2V5LCBEKTtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkpKSB7XG4gICAgaWYgKCFELmVudW1lcmFibGUpIHtcbiAgICAgIGlmICghaGFzKGl0LCBISURERU4pKSBkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkgaXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7IGVudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpIH0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApIHtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsID0ga2V5cy5sZW5ndGg7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsID4gaSkgJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCkge1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSkge1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgaXQgPSB0b0lPYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYgKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSkgRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICB2YXIgbmFtZXMgPSBnT1BOKHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgdmFyIElTX09QID0gaXQgPT09IE9iamVjdFByb3RvO1xuICB2YXIgbmFtZXMgPSBnT1BOKElTX09QID8gT1BTeW1ib2xzIDogdG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmIChoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgKElTX09QID8gaGFzKE9iamVjdFByb3RvLCBrZXkpIDogdHJ1ZSkpIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKSB0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICB2YXIgdGFnID0gdWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgICB2YXIgJHNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvKSAkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZiAoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSkgdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfTtcbiAgICBpZiAoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKSBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCBzZXQ6ICRzZXQgfSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJykuZiA9ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYgKERFU0NSSVBUT1JTICYmICFyZXF1aXJlKCcuL19saWJyYXJ5JykpIHtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxuXG4gIHdrc0V4dC5mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gd3JhcCh3a3MobmFtZSkpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFN5bWJvbDogJFN5bWJvbCB9KTtcblxuZm9yICh2YXIgZXM2U3ltYm9scyA9IChcbiAgLy8gMTkuNC4yLjIsIDE5LjQuMi4zLCAxOS40LjIuNCwgMTkuNC4yLjYsIDE5LjQuMi44LCAxOS40LjIuOSwgMTkuNC4yLjEwLCAxOS40LjIuMTEsIDE5LjQuMi4xMiwgMTkuNC4yLjEzLCAxOS40LjIuMTRcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBqID0gMDsgZXM2U3ltYm9scy5sZW5ndGggPiBqOyl3a3MoZXM2U3ltYm9sc1tqKytdKTtcblxuZm9yICh2YXIgd2VsbEtub3duU3ltYm9scyA9ICRrZXlzKHdrcy5zdG9yZSksIGsgPSAwOyB3ZWxsS25vd25TeW1ib2xzLmxlbmd0aCA+IGs7KSB3a3NEZWZpbmUod2VsbEtub3duU3ltYm9sc1trKytdKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihzeW0pIHtcbiAgICBpZiAoIWlzU3ltYm9sKHN5bSkpIHRocm93IFR5cGVFcnJvcihzeW0gKyAnIGlzIG5vdCBhIHN5bWJvbCEnKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gU3ltYm9sUmVnaXN0cnkpIGlmIChTeW1ib2xSZWdpc3RyeVtrZXldID09PSBzeW0pIHJldHVybiBrZXk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gZmFsc2U7IH1cbn0pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7IGE6IFMgfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pKSwgJ0pTT04nLCB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7XG4gICAgdmFyIGFyZ3MgPSBbaXRdO1xuICAgIHZhciBpID0gMTtcbiAgICB2YXIgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgJHJlcGxhY2VyID0gcmVwbGFjZXIgPSBhcmdzWzFdO1xuICAgIGlmICghaXNPYmplY3QocmVwbGFjZXIpICYmIGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKSByZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgICBpZiAoIWlzQXJyYXkocmVwbGFjZXIpKSByZXBsYWNlciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mICRyZXBsYWNlciA9PSAnZnVuY3Rpb24nKSB2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XG4iLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG52YXIgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuL193a3MnKSgndW5zY29wYWJsZXMnKTtcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuaWYgKEFycmF5UHJvdG9bVU5TQ09QQUJMRVNdID09IHVuZGVmaW5lZCkgcmVxdWlyZSgnLi9faGlkZScpKEFycmF5UHJvdG8sIFVOU0NPUEFCTEVTLCB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgQXJyYXlQcm90b1tVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZG9uZSwgdmFsdWUpIHtcbiAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmUgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHt9O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKTtcbnZhciBkZXNjcmlwdG9yID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KSB7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwgeyBuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpIH0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07XG4iLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcbiIsIi8vIDE5LjEuMi45IC8gMTUuMi4zLjIgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuL190by1vYmplY3QnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBPYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIChPKSB7XG4gIE8gPSB0b09iamVjdChPKTtcbiAgaWYgKGhhcyhPLCBJRV9QUk9UTykpIHJldHVybiBPW0lFX1BST1RPXTtcbiAgaWYgKHR5cGVvZiBPLmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgTyBpbnN0YW5jZW9mIE8uY29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gIH0gcmV0dXJuIE8gaW5zdGFuY2VvZiBPYmplY3QgPyBPYmplY3RQcm90byA6IG51bGw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyICRpdGVyQ3JlYXRlID0gcmVxdWlyZSgnLi9faXRlci1jcmVhdGUnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBCVUdHWSA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKTsgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxudmFyIEZGX0lURVJBVE9SID0gJ0BAaXRlcmF0b3InO1xudmFyIEtFWVMgPSAna2V5cyc7XG52YXIgVkFMVUVTID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uIChraW5kKSB7XG4gICAgaWYgKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKSByZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgdmFyIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFUztcbiAgdmFyIFZBTFVFU19CVUcgPSBmYWxzZTtcbiAgdmFyIHByb3RvID0gQmFzZS5wcm90b3R5cGU7XG4gIHZhciAkbmF0aXZlID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdO1xuICB2YXIgJGRlZmF1bHQgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKTtcbiAgdmFyICRlbnRyaWVzID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZDtcbiAgdmFyICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlO1xuICB2YXIgbWV0aG9kcywga2V5LCBJdGVyYXRvclByb3RvdHlwZTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZiAoJGFueU5hdGl2ZSkge1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKCkpKTtcbiAgICBpZiAoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgSXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmICghTElCUkFSWSAmJiB0eXBlb2YgSXRlcmF0b3JQcm90b3R5cGVbSVRFUkFUT1JdICE9ICdmdW5jdGlvbicpIGhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZiAoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKSB7XG4gICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmICgoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSkge1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gPSByZXR1cm5UaGlzO1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IERFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYgKEZPUkNFRCkgZm9yIChrZXkgaW4gbWV0aG9kcykge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3RvKSkgcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhZGRUb1Vuc2NvcGFibGVzID0gcmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJyk7XG52YXIgc3RlcCA9IHJlcXVpcmUoJy4vX2l0ZXItc3RlcCcpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcblxuLy8gMjIuMS4zLjQgQXJyYXkucHJvdG90eXBlLmVudHJpZXMoKVxuLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcbi8vIDIyLjEuMy4yOSBBcnJheS5wcm90b3R5cGUudmFsdWVzKClcbi8vIDIyLjEuMy4zMCBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbiAoaXRlcmF0ZWQsIGtpbmQpIHtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbiAoKSB7XG4gIHZhciBPID0gdGhpcy5fdDtcbiAgdmFyIGtpbmQgPSB0aGlzLl9rO1xuICB2YXIgaW5kZXggPSB0aGlzLl9pKys7XG4gIGlmICghTyB8fCBpbmRleCA+PSBPLmxlbmd0aCkge1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYgKGtpbmQgPT0gJ2tleXMnKSByZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmIChraW5kID09ICd2YWx1ZXMnKSByZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7XG4iLCJ2YXIgJGl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgd2tzID0gcmVxdWlyZSgnLi9fd2tzJyk7XG52YXIgSVRFUkFUT1IgPSB3a3MoJ2l0ZXJhdG9yJyk7XG52YXIgVE9fU1RSSU5HX1RBRyA9IHdrcygndG9TdHJpbmdUYWcnKTtcbnZhciBBcnJheVZhbHVlcyA9IEl0ZXJhdG9ycy5BcnJheTtcblxudmFyIERPTUl0ZXJhYmxlcyA9IHtcbiAgQ1NTUnVsZUxpc3Q6IHRydWUsIC8vIFRPRE86IE5vdCBzcGVjIGNvbXBsaWFudCwgc2hvdWxkIGJlIGZhbHNlLlxuICBDU1NTdHlsZURlY2xhcmF0aW9uOiBmYWxzZSxcbiAgQ1NTVmFsdWVMaXN0OiBmYWxzZSxcbiAgQ2xpZW50UmVjdExpc3Q6IGZhbHNlLFxuICBET01SZWN0TGlzdDogZmFsc2UsXG4gIERPTVN0cmluZ0xpc3Q6IGZhbHNlLFxuICBET01Ub2tlbkxpc3Q6IHRydWUsXG4gIERhdGFUcmFuc2Zlckl0ZW1MaXN0OiBmYWxzZSxcbiAgRmlsZUxpc3Q6IGZhbHNlLFxuICBIVE1MQWxsQ29sbGVjdGlvbjogZmFsc2UsXG4gIEhUTUxDb2xsZWN0aW9uOiBmYWxzZSxcbiAgSFRNTEZvcm1FbGVtZW50OiBmYWxzZSxcbiAgSFRNTFNlbGVjdEVsZW1lbnQ6IGZhbHNlLFxuICBNZWRpYUxpc3Q6IHRydWUsIC8vIFRPRE86IE5vdCBzcGVjIGNvbXBsaWFudCwgc2hvdWxkIGJlIGZhbHNlLlxuICBNaW1lVHlwZUFycmF5OiBmYWxzZSxcbiAgTmFtZWROb2RlTWFwOiBmYWxzZSxcbiAgTm9kZUxpc3Q6IHRydWUsXG4gIFBhaW50UmVxdWVzdExpc3Q6IGZhbHNlLFxuICBQbHVnaW46IGZhbHNlLFxuICBQbHVnaW5BcnJheTogZmFsc2UsXG4gIFNWR0xlbmd0aExpc3Q6IGZhbHNlLFxuICBTVkdOdW1iZXJMaXN0OiBmYWxzZSxcbiAgU1ZHUGF0aFNlZ0xpc3Q6IGZhbHNlLFxuICBTVkdQb2ludExpc3Q6IGZhbHNlLFxuICBTVkdTdHJpbmdMaXN0OiBmYWxzZSxcbiAgU1ZHVHJhbnNmb3JtTGlzdDogZmFsc2UsXG4gIFNvdXJjZUJ1ZmZlckxpc3Q6IGZhbHNlLFxuICBTdHlsZVNoZWV0TGlzdDogdHJ1ZSwgLy8gVE9ETzogTm90IHNwZWMgY29tcGxpYW50LCBzaG91bGQgYmUgZmFsc2UuXG4gIFRleHRUcmFja0N1ZUxpc3Q6IGZhbHNlLFxuICBUZXh0VHJhY2tMaXN0OiBmYWxzZSxcbiAgVG91Y2hMaXN0OiBmYWxzZVxufTtcblxuZm9yICh2YXIgY29sbGVjdGlvbnMgPSBnZXRLZXlzKERPTUl0ZXJhYmxlcyksIGkgPSAwOyBpIDwgY29sbGVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgdmFyIE5BTUUgPSBjb2xsZWN0aW9uc1tpXTtcbiAgdmFyIGV4cGxpY2l0ID0gRE9NSXRlcmFibGVzW05BTUVdO1xuICB2YXIgQ29sbGVjdGlvbiA9IGdsb2JhbFtOQU1FXTtcbiAgdmFyIHByb3RvID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIGtleTtcbiAgaWYgKHByb3RvKSB7XG4gICAgaWYgKCFwcm90b1tJVEVSQVRPUl0pIGhpZGUocHJvdG8sIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG4gICAgaWYgKCFwcm90b1tUT19TVFJJTkdfVEFHXSkgaGlkZShwcm90bywgVE9fU1RSSU5HX1RBRywgTkFNRSk7XG4gICAgSXRlcmF0b3JzW05BTUVdID0gQXJyYXlWYWx1ZXM7XG4gICAgaWYgKGV4cGxpY2l0KSBmb3IgKGtleSBpbiAkaXRlcmF0b3JzKSBpZiAoIXByb3RvW2tleV0pIHJlZGVmaW5lKHByb3RvLCBrZXksICRpdGVyYXRvcnNba2V5XSwgdHJ1ZSk7XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNldHVwRE9NKCkge1xuXHRkaXNwbGF5RmVlZCgpO1xuXG5cdGxpc3RlbigpO1xuXG5cdGdldEZ1dHVyZUV2ZW50cygpO1xufVxuXG5mdW5jdGlvbiBoaWRlR3JvdXAoZ3JvdXBJZCkge1xuXHRjb25zdCBncm91cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWdyb3VwPVwiJyArIGdyb3VwSWQgKyAnXCJdJyk7XG5cblx0W10uZm9yRWFjaC5jYWxsKGdyb3VwLCBmdW5jdGlvbihkaXYpIHtcblx0ICBkaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0dyb3VwKGdyb3VwSWQpIHtcblx0Y29uc3QgZ3JvdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1ncm91cD1cIicgKyBncm91cElkICsgJ1wiXScpO1xuXG5cdFtdLmZvckVhY2guY2FsbChncm91cCwgZnVuY3Rpb24oZGl2KSB7XG5cdCAgZGl2LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG5cdH0pO1xufVxuXG4vLyBmdW5jdGlvbiBoeWRyYXRlQmFua3JvbGwoKSB7XG4vLyBcdGNvbnN0IGNvbnRyYWN0QmFsYW5jZSA9IG5ldyBCTihnYW1lLmluZm8uX2NvbnRyYWN0QmFsYW5jZSk7XG4vLyBcdGNvbnN0IGJhbmtyb2xsID0gZnJvbVdlaVRvRXRoKGNvbnRyYWN0QmFsYW5jZSk7XG5cbi8vIFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJhbmtyb2xsIHNwYW4nKS5pbm5lckhUTUwgPSBiYW5rcm9sbDtcbi8vIH1cblxuLy8gZnVuY3Rpb24gaHlkcmF0ZUlucHV0KCkge1xuLy8gXHRjb25zdCBtaW4gPSBwYXJzZUZsb2F0KGZyb21XZWlUb0V0aChnYW1lLmluZm8uX21pbkNvc3QpKS50b0ZpeGVkKDMpO1xuLy8gXHRjb25zdCBtYXggPSBwYXJzZUZsb2F0KGZyb21XZWlUb0V0aChnYW1lLmluZm8uX21heENvc3QpKS50b0ZpeGVkKDMpO1xuXG4vLyBcdGNvbnN0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1pbi1tYXggaW5wdXQnKTtcbi8vIFx0aW5wdXQuc2V0QXR0cmlidXRlKCdtaW4nLCBtaW4pO1xuLy8gXHRpbnB1dC5zZXRBdHRyaWJ1dGUoJ21heCcsIG1heCk7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIGh5ZHJhdGVNaW4oKSB7XG4vLyBcdGNvbnN0IG1pbiA9IHBhcnNlRmxvYXQoZnJvbVdlaVRvRXRoKGdhbWUuaW5mby5fbWluQ29zdCkpLnRvRml4ZWQoMyk7XG5cbi8vIFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1pbiAudmFsdWUnKS5pbm5lckhUTUwgPSBgJHttaW59IEVUSGA7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIGh5ZHJhdGVNYXgoKSB7XG4vLyBcdGNvbnN0IG1heCA9IHBhcnNlRmxvYXQoZnJvbVdlaVRvRXRoKGdhbWUuaW5mby5fbWF4Q29zdCkpLnRvRml4ZWQoMyk7XG5cdFxuLy8gXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWF4IC52YWx1ZScpLmlubmVySFRNTCA9IGAke21heH0gRVRIYDtcbi8vIH1cblxuLy8gZnVuY3Rpb24gaHlkcmF0ZVNldFBsYXllck5hbWUoKSB7XG4vLyBcdGNvbnN0IGNvc3QgPSBmcm9tV2VpVG9FdGgoZ2FtZS5pbmZvLl9uYW1lQ29zdCk7XG5cbi8vIFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZhbml0eS1uYW1lIGJ1dHRvbiAuY29zdCcpLmlubmVySFRNTCA9IGAke2Nvc3R9IEVUSGA7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIGh5ZHJhdGVQb3N0TWVzc2FnZSgpIHtcbi8vIFx0Y29uc3QgY29zdCA9IGZyb21XZWlUb0V0aChnYW1lLmluZm8uX21lc3NhZ2VDb3N0KTtcblxuLy8gXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9zdCBidXR0b24gLmNvc3QnKS5pbm5lckhUTUwgPSBgJHtjb3N0fSBFVEhgO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBnZW5lcmF0ZUluZm9Cb3goKSB7XG4vLyBcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbmZvLWJveCcpLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgXG4vLyBcdFx0YDx0YWJsZT5cbi8vIFx0XHRcdDx0Ym9keT5cbi8vIFx0XHRcdFx0PHRyPlxuLy8gXHRcdFx0XHRcdDx0ZD5Db250cmFjdDwvdGQ+XG4vLyBcdFx0XHRcdDwvdHI+XG4vLyBcdFx0XHRcdDx0cj5cbi8vIFx0XHRcdFx0XHQ8dGQgY2xhc3M9XCJhZGRyZXNzXCI+PGEgaHJlZj1cImh0dHBzOi8vcm9wc3Rlbi5ldGhlcnNjYW4uaW8vYWRkcmVzcy8ke2dhbWUuYWRkcmVzc31cIj4ke2dhbWUuYWRkcmVzc308L2E+PC90ZD5cbi8vIFx0XHRcdFx0PC90cj5cbi8vIFx0XHRcdDwvdGJvZHk+XG4vLyBcdFx0PC90YWJsZT5gXG4vLyBcdCk7XG4vLyB9XG5cbmZ1bmN0aW9uIGxpc3RlbigpIHtcblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW2RhdGEtYWN0aW9uPVwic3RhcnRcIl0nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN0YXJ0KTtcblxuXHRjb25zdCBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJvdyBkaXZbZGF0YS1wb3NpdGlvbl0nKTtcblxuXHRmb3IgKGNvbnN0IGJ1dHRvbiBvZiBidXR0b25zKSB7XG5cdCAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0ICBcdHRha2VBY3Rpb24oZXZlbnQpO1xuXHQgIH0pO1xuXHR9XG5cblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFjdGlvbi1zZWxlY3Rpb24gW2RhdGEtYWN0aW9uPVwibW92ZVwiXScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZWN0QWN0aW9uTW92ZSk7XG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hY3Rpb24tc2VsZWN0aW9uIFtkYXRhLWFjdGlvbj1cInBsYWNlXCJdJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxlY3RBY3Rpb25QbGFjZSk7XG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hY3Rpb24tc2VsZWN0aW9uIFtkYXRhLWFjdGlvbj1cInJldmVhbFwiXScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZWN0QWN0aW9uUmV2ZWFsKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnQoKSB7XG5cdC8vIGNhbGwgbWV0aG9kIG9uIGNvbnRyYWN0IHRvIGRpZ1xuXHRjb25zdCBmcm9tID0gYXdhaXQgd2ViMy5ldGguZ2V0Q29pbmJhc2UoKTtcblx0Y29uc3QgdG8gPSBnYW1lLmFkZHJlc3M7XG5cdGNvbnN0IGRhdGEgPSBnYW1lLmNvbnRyYWN0Lm1ldGhvZHMuc3RhcnQoKS5lbmNvZGVBQkkoKTtcblx0Y29uc3QgdmFsdWUgPSBuZXcgQk4oJzAnKTtcblxuXHR3ZWIzLmV0aC5zZW5kVHJhbnNhY3Rpb24oe1xuXHQgIGZyb20sXG5cdCAgdG8sXG5cdCAgdmFsdWUsXG5cdCAgZGF0YVxuXHR9KS5vbigndHJhbnNhY3Rpb25IYXNoJywgKGhhc2gpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygndHJhbnNhY3Rpb24gaGFzaDonLCBoYXNoKTtcblx0fSkub24oJ3JlY2VpcHQnLCAocmVjZWlwdCkgPT4ge1xuXHRcdC8vIGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdC8vIGNvbnNvbGUubG9nKCd0cmFuc2FjdGlvbiByZWNlaXB0OicsIGhhc2gpO1xuXHR9KS5vbignY29uZmlybWF0aW9uJywgKG5vbmNlLCByZWNlaXB0KSA9PiB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2NvbmZpcm1hdGlvbiByZWNlaXB0OicsIHJlY2VpcHQpO1xuXHR9KS5vbignZXJyb3InLCBjb25zb2xlLmVycm9yKTsgLy8gSWYgYSBvdXQgb2YgZ2FzIGVycm9yLCB0aGUgc2Vjb25kIHBhcmFtZXRlciBpcyB0aGUgcmVjZWlwdC47XG5cblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW2RhdGEtYWN0aW9uPVwic3RhcnRcIl0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0YWtlQWN0aW9uKGUpIHtcblx0Y29uc29sZS5sb2coJ3Rha2UgYWN0aW9uIGFkc2Y6JywgZS50YXJnZXQpO1xuXHQvLyBnZXQgY29vcmRpbmF0ZVxuXHRjb25zdCBjb29yZCA9IGUudGFyZ2V0LmRhdGFzZXQucG9zaXRpb247XG5cdGNvbnNvbGUubG9nKCdjb29yZCcsIGNvb3JkKTtcblxuXHRjb25zb2xlLmxvZygnZ2FtZSBhY3Rpb24nLCBnYW1lLmFjdGlvbik7XG5cblx0aWYgKGdhbWUuYWN0aW9uID09PSAnbW92ZScpIHtcblx0XHRhd2FpdCBzZW5kTW92ZShjb29yZCk7XG5cdH1cblxuXHRpZiAoZ2FtZS5hY3Rpb24gPT09ICdwbGFjZScpIHtcblxuXHR9XG5cblx0aWYgKGdhbWUuYWN0aW9uID09PSAncmV2ZWFsJykge1xuXG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VuZE1vdmUocG9zaXRpb24pIHtcblx0Y29uc29sZS5sb2coJ3NlbmRNb3ZlJywgcG9zaXRpb24pO1xuXG5cdGNvbnN0IGZyb20gPSBhd2FpdCB3ZWIzLmV0aC5nZXRDb2luYmFzZSgpO1xuXHRjb25zdCB0byA9IGdhbWUuYWRkcmVzcztcblx0Y29uc3QgZGF0YSA9IGdhbWUuY29udHJhY3QubWV0aG9kcy5tb3ZlKHBvc2l0aW9uLnNwbGl0KCcsJykpLmVuY29kZUFCSSgpO1xuXHRjb25zdCB2YWx1ZSA9IG5ldyBCTignMCcpO1xuXG5cdHdlYjMuZXRoLnNlbmRUcmFuc2FjdGlvbih7XG5cdCAgZnJvbSxcblx0ICB0byxcblx0ICB2YWx1ZSxcblx0ICBkYXRhXG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzZWxlY3RBY3Rpb25Nb3ZlKGUpIHtcblx0c2V0QWN0aXZlQWN0aW9uKGUudGFyZ2V0KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0QWN0aW9uUGxhY2UoZSkge1xuXHRzZXRBY3RpdmVBY3Rpb24oZS50YXJnZXQpO1xufVxuXG5mdW5jdGlvbiBzZWxlY3RBY3Rpb25SZXZlYWwoZSkge1xuXHRzZXRBY3RpdmVBY3Rpb24oZS50YXJnZXQpO1xufVxuXG5mdW5jdGlvbiBzZXRBY3RpdmVBY3Rpb24oc2VsZWN0ZWRBY3Rpb24pIHtcblx0Y29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hY3Rpb24tc2VsZWN0aW9uIGJ1dHRvbicpO1xuXG5cdFtdLmZvckVhY2guY2FsbChhY3Rpb25zLCAoYWN0aW9uKSA9PiB7XG5cdFx0YWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHR9KTtcblxuXHRzZWxlY3RlZEFjdGlvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuXHRnYW1lLmFjdGlvbiA9IHNlbGVjdGVkQWN0aW9uLmRhdGFzZXQuYWN0aW9uO1xufVxuXG5mdW5jdGlvbiBnZXRGdXR1cmVFdmVudHMoKSB7XG5cdGdhbWUuY29udHJhY3QuZXZlbnRzLmFsbEV2ZW50cygoZXJyb3IsIGV2ZW50KSA9PiB7XG5cdFx0ZGlzcGxheUV2ZW50KGV2ZW50KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlGZWVkKCkge1xuXHRjb25zdCBtYXJrdXAgPSBnYW1lLnBhc3RFdmVudHMubWFwKChwYXN0RXZlbnQpID0+IHtcblx0XHRjb25zdCB7ZXZlbnQsIHRyYW5zYWN0aW9uSGFzaCwgcmV0dXJuVmFsdWVzfSA9IHBhc3RFdmVudDtcblxuXHRcdGlmIChyZXR1cm5WYWx1ZXMuX2dhbWVJZCAhPT0gZ2FtZS5jdXJyZW50R2FtZUlkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGA8ZGl2IGNsYXNzPVwiZXZlbnRcIiBkYXRhLWV2ZW50PVwiJHtldmVudH1cIj5cblx0XHRcdCR7Y3JlYXRlQ2FyZChwYXN0RXZlbnQpfVxuXHRcdDwvZGl2PmA7XG5cdH0pLnJldmVyc2UoKTtcblxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZXZlbnQtZmVlZCcpLmlubmVySFRNTCArPSBtYXJrdXAuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlFdmVudChldmVudCkge1xuXHRjb25zb2xlLmxvZygnZGlzcGxheUV2ZW50OicsIGV2ZW50KTtcblxuXHRsZXQgbWFya3VwID0gYDxkaXYgY2xhc3M9XCJldmVudFwiIGRhdGEtZXZlbnQ9XCIke2V2ZW50LmV2ZW50fVwiPlxuXHRcdCR7Y3JlYXRlQ2FyZChldmVudCl9XG5cdDwvZGl2PmA7XG5cblx0Y29uc29sZS5sb2coJ21hcmt1cDonLCBtYXJrdXApO1xuXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ldmVudC1mZWVkJykuaW5uZXJIVE1MID0gbWFya3VwICsgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmV2ZW50LWZlZWQnKS5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhcmQoe2V2ZW50LCB0cmFuc2FjdGlvbkhhc2gsIHJldHVyblZhbHVlc30pIHtcblxuXHRjb25zb2xlLmxvZygnY3JlYXRlIGNhcmQ6JywgZXZlbnQpO1xuXG5cdC8vIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShwYXJzZUludChldmVudC50aW1lU3RhbXApICogMTAwMCk7XG5cdC8vIDxkaXYgY2xhc3M9XCJ0aW1lc3RhbXBcIj4ke2RhdGUudG9EYXRlU3RyaW5nKCl9IC0gJHtkYXRlLnRvTG9jYWxlVGltZVN0cmluZygpfTwvZGl2PlxuXG5cdGlmKGV2ZW50ID09PSAnT25Kb2luJykge1xuXHRcdHJldHVybiBjcmVhdGVPbkpvaW4oKTtcblx0fSBlbHNlIGlmIChldmVudCA9PT0gJ09uTW92ZScpIHtcblx0XHRyZXR1cm4gY3JlYXRlT25Nb3ZlKCk7XG5cdH0gZWxzZSBpZiAoZXZlbnQgPT09ICdPblBsYWNlJykge1xuXHRcdHJldHVybiBjcmVhdGVPblBsYWNlKCk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVPbkpvaW4oKSB7XG5cdFx0Y29uc3QgeyBfcGxheWVyQWRkcmVzcywgX2dhbWVJZCB9ID0gcmV0dXJuVmFsdWVzO1xuXHRcdGdhbWUucGxheWVycy5wdXNoKHRvQ2hlY2tTdW1BZGRyZXNzKF9wbGF5ZXJBZGRyZXNzKSk7XG5cblx0XHRpZiAoZ2FtZS5wbGF5ZXJzLmluZGV4T2YodG9DaGVja1N1bUFkZHJlc3MoZ2FtZS5wbGF5ZXJBZGRyZXNzKSkgPiAtMSkge1xuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW2RhdGEtYWN0aW9uPVwic3RhcnRcIl0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFjdGlvbi1zZWxlY3Rpb24nKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cdFx0fVxuXG5cblxuXHRcdC8vIGlmIChnYW1lLnBsYXllcnMubGVuZ3RoID09PSAzKSB7XG5cdFx0Ly8gXHRsZXQgY291bnRlciA9IDE7XG5cblx0XHQvLyBcdGdhbWUucG9zaXRpb25zID0gZ2FtZS5wbGF5ZXJzLm1hcCgocGxheWVyKSA9PiB7XG5cdFx0Ly8gXHRcdGlmIChwbGF5ZXIgPT09IHRvQ2hlY2tTdW1BZGRyZXNzKGdhbWUucGxheWVyQWRkcmVzcykpIHtcblx0XHQvLyBcdFx0XHRyZXR1cm4gMDtcblx0XHQvLyBcdFx0fSBlbHNlIHtcblx0XHQvLyBcdFx0XHRjb3VudGVyKys7XG5cdFx0Ly8gXHRcdFx0cmV0dXJuIGNvdW50ZXIgLSAxO1xuXHRcdC8vIFx0XHR9XG5cdFx0Ly8gXHR9KTtcblx0XHQvLyB9XG5cblx0XHRyZXR1cm4gYDxkaXY+JHtfcGxheWVyQWRkcmVzcy5zdWJzdHJpbmcoMCwgMjEpfTwvZGl2PjxkaXY+aXMgUmVhZHkgdG8gQ29sbHVkZTwvZGl2PmA7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVPbk1vdmUoKSB7XG5cdFx0Y29uc3QgeyBfcGxheWVyQWRkcmVzcywgX3Bvc2l0aW9uIH0gPSByZXR1cm5WYWx1ZXM7XG5cblx0XHRjb25zb2xlLmxvZygnY3JlYXRlIG9uIG1vdmU6JywgX3BsYXllckFkZHJlc3MsIF9wb3NpdGlvbik7XG5cblx0XHRyZXR1cm4gYDxkaXY+JHtfcGxheWVyQWRkcmVzcy5zdWJzdHJpbmcoMCwgMjEpfTwvZGl2PjxkaXY+TW92ZWQgdG8gJHtfcG9zaXRpb259PC9kaXY+YDtcblx0fVxuXG5cdC8vIGZ1bmN0aW9uIGNyZWF0ZU9uUGxhY2UoKSB7XG5cdC8vIFx0Y29uc3QgeyBfcGxheWVyQWRkcmVzcywgX3Bvc2l0aW9uIH0gPSByZXR1cm5WYWx1ZXM7XG5cblx0Ly8gXHRyZXR1cm4gYDxkaXY+JHtfcGxheWVyQWRkcmVzcy5zdWJzdHJpbmcoMCwgMjEpfTwvZGl2PjxkaXY+TW92ZWQgdG8gJHtfcG9zaXRpb259PC9kaXY+YDtcblx0Ly8gfVxuXG5cdC8vIGZ1bmN0aW9uIGNyZWF0ZU9uUmV2ZWFsKCkge1xuXHQvLyBcdGNvbnN0IHsgX3BsYXllckFkZHJlc3MsIF9wb3NpdGlvbiB9ID0gcmV0dXJuVmFsdWVzO1xuXG5cdC8vIFx0cmV0dXJuIGA8ZGl2PiR7X3BsYXllckFkZHJlc3Muc3Vic3RyaW5nKDAsIDIxKX08L2Rpdj48ZGl2Pk1vdmVkIHRvICR7X3Bvc2l0aW9ufTwvZGl2PmA7XG5cdC8vIH1cbn1cblxuZnVuY3Rpb24gZnJvbVdlaVRvRXRoKHdlaUFtb3VudCkge1xuXHRyZXR1cm4gd2ViMy51dGlscy5mcm9tV2VpKHdlaUFtb3VudCwgJ2V0aGVyJykudG9TdHJpbmcoKS5zdWJzdHJpbmcoMCw3KTtcbn1cblxuZnVuY3Rpb24gdG9DaGVja1N1bUFkZHJlc3MoYWRkcmVzcykge1xuXHRyZXR1cm4gd2ViMy51dGlscy50b0NoZWNrc3VtQWRkcmVzcyhhZGRyZXNzKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmFuZG9tKF9yYW5kb20pIHtcblx0Y29uc3QgcmFuZG9tTWFwID0ge1xuXHRcdCcwJzogJzAuMDB4Jyxcblx0XHQnMSc6ICcwLjIweCcsXG5cdFx0JzInOiAnMC40MHgnLFxuXHRcdCczJzogJzAuNjB4Jyxcblx0XHQnNCc6ICcwLjgweCcsXG5cdFx0JzUnOiAnMS4wMHgnLFxuXHRcdCc2JzogJzEuMjV4Jyxcblx0XHQnNyc6ICcxLjUweCcsXG5cdFx0JzgnOiAnMS43NXgnLFxuXHRcdCc5JzogJzIuMDB4Jyxcblx0fVxuXG5cdHJldHVybiByYW5kb21NYXBbX3JhbmRvbV07XG59XG5cblxuLy8gYXN5bmMgZnVuY3Rpb24ga2lsbGluX2l0KCkge1xuLy8gXHRjb25zdCBmcm9tID0gYXdhaXQgd2ViMy5ldGguZ2V0Q29pbmJhc2UoKTtcbi8vIFx0Y29uc3QgdG8gPSBnYW1lLmFkZHJlc3M7XG4vLyBcdGNvbnN0IGRhdGEgPSBnYW1lLmNvbnRyYWN0Lm1ldGhvZHMua2lsbCgpLmVuY29kZUFCSSgpO1xuLy8gXHRjb25zdCB2YWx1ZSA9IG5ldyBCTignMCcpO1xuXG4vLyBcdHdlYjMuZXRoLnNlbmRUcmFuc2FjdGlvbih7XG4vLyBcdCAgZnJvbSxcbi8vIFx0ICB0byxcbi8vIFx0ICB2YWx1ZSxcbi8vIFx0ICBkYXRhXG4vLyBcdH0pLm9uKCd0cmFuc2FjdGlvbkhhc2gnLCAoaGFzaCkgPT4ge1xuLy8gXHRcdGNvbnNvbGUubG9nKCd0cmFuc2FjdGlvbiBoYXNoOicsIGhhc2gpO1xuLy8gXHR9KS5vbigncmVjZWlwdCcsIChyZWNlaXB0KSA9PiB7XG4vLyBcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG4vLyBcdH0pLm9uKCdjb25maXJtYXRpb24nLCAobm9uY2UsIHJlY2VpcHQpID0+IHtcbi8vIFx0XHRjb25zb2xlLmxvZygnY29uZmlybWF0aW9uIHJlY2VpcHQ6JywgcmVjZWlwdCk7XG4vLyBcdH0pLm9uKCdlcnJvcicsIGNvbnNvbGUuZXJyb3IpOyAvLyBJZiBhIG91dCBvZiBnYXMgZXJyb3IsIHRoZSBzZWNvbmQgcGFyYW1ldGVyIGlzIHRoZSByZWNlaXB0Ljtcbi8vIH1cblxuXG5cblxuXG5cbiIsImltcG9ydCBzZXR1cFdlYjMgZnJvbSAnLi9nYW1lL3NldHVwV2ViMyc7XG5pbXBvcnQgc2V0dXBHYW1lU3RhdGUgZnJvbSAnLi9nYW1lL3NldHVwR2FtZVN0YXRlJztcbmltcG9ydCBzZXR1cERPTSBmcm9tICcuL2dhbWUvc2V0dXBET00nO1xuXG53aW5kb3cuZ2FtZSA9IHdpbmRvdy5nYW1lIHx8IHt9O1xuXG5hc3luYyBmdW5jdGlvbiBzdGFydFRoZUVuZ2luZSgpIHtcblx0YXdhaXQgc2V0dXBXZWIzKCk7XG5cdGF3YWl0IHNldHVwR2FtZVN0YXRlKCk7XG5cdHNldHVwRE9NKCk7XG59XG5cbnN0YXJ0VGhlRW5naW5lKCk7Il0sIm5hbWVzIjpbInNldHVwV2ViMyIsIndpbmRvdyIsImV0aGVyZXVtIiwiY29uc29sZSIsImxvZyIsIndlYjMiLCJXZWIzIiwiZ2l2ZW5Qcm92aWRlciIsImN1cnJlbnRQcm92aWRlciIsImlzQ29ubmVjdGVkIiwiZXRoIiwibmV0IiwiZ2V0TmV0d29ya1R5cGUiLCJlcnIiLCJkYXRhIiwiZ2FtZSIsIm5ldHdvcmsiLCJCTiIsInV0aWxzIiwiaW50ZXJmYWNlIiwiYWRkcmVzcyIsInNldHVwR2FtZVN0YXRlIiwiY29sbHVzaW9uIiwiY29udHJhY3QiLCJnZXRDb250cmFjdCIsImdldEN1cnJlbnRHYW1lSWQiLCJjdXJyZW50R2FtZUlkIiwiZ2V0UGFzdEV2ZW50cyIsInBhc3RFdmVudHMiLCJnZXRDb2luYmFzZSIsInBsYXllckFkZHJlc3MiLCJwbGF5ZXJzIiwicG9zaXRpb25zIiwiYWN0aW9uIiwiQ29udHJhY3QiLCJtZXRob2RzIiwiY2FsbCIsImdldFRvdGFsUGxheWVycyIsInRvdGFsUGxheWVycyIsImZyb21CbG9jayIsInRvQmxvY2siLCJmaWx0ZXIiLCJfZ2FtZUlkIiwiZ2xvYmFsIiwiY29yZSIsInJlcXVpcmUkJDAiLCJpZCIsInJlcXVpcmUkJDEiLCJ1aWQiLCJpc09iamVjdCIsImNvZiIsImFuT2JqZWN0IiwiYUZ1bmN0aW9uIiwiZGVmaW5lZCIsInRvSW50ZWdlciIsImNsYXNzb2YiLCJyZWdleHBGbGFncyIsImRvY3VtZW50IiwicmVxdWlyZSQkMiIsInRvUHJpbWl0aXZlIiwiSUU4X0RPTV9ERUZJTkUiLCJkUCIsImNyZWF0ZURlc2MiLCIkdG9TdHJpbmciLCJoYXMiLCJoaWRlIiwiY3R4IiwicmVkZWZpbmUiLCJyZWdleHBFeGVjIiwiU1BFQ0lFUyIsIndrcyIsImZhaWxzIiwiTEFTVF9JTkRFWCIsImlzUmVnRXhwIiwic3BlY2llc0NvbnN0cnVjdG9yIiwiY2FsbFJlZ0V4cEV4ZWMiLCJ0b0xlbmd0aCIsImFkdmFuY2VTdHJpbmdJbmRleCIsIkRFU0NSSVBUT1JTIiwiJGZsYWdzIiwiTElCUkFSWSIsIndrc0V4dCIsIlRBRyIsIklPYmplY3QiLCJtaW4iLCJ0b0lPYmplY3QiLCJ0b0Fic29sdXRlSW5kZXgiLCIka2V5cyIsImVudW1CdWdLZXlzIiwiZ2V0S2V5cyIsImdPUFMiLCJwSUUiLCJJRV9QUk9UTyIsIlBST1RPVFlQRSIsImRQcyIsInRvU3RyaW5nIiwiZ09QRCIsIiRHT1BEIiwiJERQIiwiZ09QTiIsImdPUE5FeHQiLCJzaGFyZWQiLCIkZmFpbHMiLCJfY3JlYXRlIiwiZW51bUtleXMiLCJyZXF1aXJlJCQzIiwicmVxdWlyZSQkNCIsIiRleHBvcnQiLCJ3a3NEZWZpbmUiLCJpc0FycmF5IiwicmVxdWlyZSQkNSIsInNldFRvU3RyaW5nVGFnIiwiY3JlYXRlIiwiZGVzY3JpcHRvciIsIk9iamVjdFByb3RvIiwidG9PYmplY3QiLCIkaXRlckNyZWF0ZSIsImdldFByb3RvdHlwZU9mIiwiSXRlcmF0b3JzIiwic3RlcCIsImFkZFRvVW5zY29wYWJsZXMiLCJJVEVSQVRPUiIsIiRpdGVyYXRvcnMiLCJzZXR1cERPTSIsImRpc3BsYXlGZWVkIiwibGlzdGVuIiwiZ2V0RnV0dXJlRXZlbnRzIiwicXVlcnlTZWxlY3RvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJzdGFydCIsImJ1dHRvbnMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiYnV0dG9uIiwiZXZlbnQiLCJ0YWtlQWN0aW9uIiwic2VsZWN0QWN0aW9uTW92ZSIsInNlbGVjdEFjdGlvblBsYWNlIiwic2VsZWN0QWN0aW9uUmV2ZWFsIiwiZnJvbSIsInRvIiwiZW5jb2RlQUJJIiwidmFsdWUiLCJzZW5kVHJhbnNhY3Rpb24iLCJvbiIsImhhc2giLCJyZWNlaXB0Iiwibm9uY2UiLCJlcnJvciIsInN0eWxlIiwiZGlzcGxheSIsImUiLCJ0YXJnZXQiLCJjb29yZCIsImRhdGFzZXQiLCJwb3NpdGlvbiIsInNlbmRNb3ZlIiwibW92ZSIsInNwbGl0Iiwic2V0QWN0aXZlQWN0aW9uIiwic2VsZWN0ZWRBY3Rpb24iLCJhY3Rpb25zIiwiZm9yRWFjaCIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsImV2ZW50cyIsImFsbEV2ZW50cyIsImRpc3BsYXlFdmVudCIsIm1hcmt1cCIsIm1hcCIsInBhc3RFdmVudCIsInRyYW5zYWN0aW9uSGFzaCIsInJldHVyblZhbHVlcyIsImNyZWF0ZUNhcmQiLCJyZXZlcnNlIiwiaW5uZXJIVE1MIiwiam9pbiIsImNyZWF0ZU9uSm9pbiIsImNyZWF0ZU9uTW92ZSIsImNyZWF0ZU9uUGxhY2UiLCJfcGxheWVyQWRkcmVzcyIsInB1c2giLCJ0b0NoZWNrU3VtQWRkcmVzcyIsImluZGV4T2YiLCJzdWJzdHJpbmciLCJfcG9zaXRpb24iLCJ0b0NoZWNrc3VtQWRkcmVzcyIs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Q0ksWUFBVSxDQUFDLENBQUM7U0FDdEMsSUFBSSxTQUFTLEdBQUcsYUFBYSxFQUFFO1dBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7V0FDdEQsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUMzRixVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQzlCLGFBQWEsR0FBRyxTQUFTLENBQUM7V0FDMUIsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksVUFBVSxFQUFFLE1BQU07VUFDekM7U0FDRCxJQUFJLGFBQWEsQ0FBQ0EsWUFBVSxDQUFDLEtBQUssS0FBSyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUNBLFlBQVUsQ0FBQyxFQUFFLENBQUM7UUFDNUU7T0FDRCxJQUFJLGFBQWEsS0FBSyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7U0FDcEMsSUFBSSxVQUFVLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUQsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztPQUNoRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEdBQUcsTUFBTSxDQUFDO01BQzNFLENBQUM7O0lBRUgsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVB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
