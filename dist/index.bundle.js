(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["vitrarius"] = factory(); else root["vitrarius"] = factory();
})(this, function() {
    return function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) {
                return installedModules[moduleId].exports;
            }
            var module = installedModules[moduleId] = {
                i: moduleId,
                l: false,
                exports: {}
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.l = true;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports, name, getter) {
            if (!__webpack_require__.o(exports, name)) {
                Object.defineProperty(exports, name, {
                    configurable: false,
                    enumerable: true,
                    get: getter
                });
            }
        };
        __webpack_require__.n = function(module) {
            var getter = module && module.__esModule ? function getDefault() {
                return module["default"];
            } : function getModuleExports() {
                return module;
            };
            __webpack_require__.d(getter, "a", getter);
            return getter;
        };
        __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 0);
    }([ function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.optic = optic;
        exports.lens = lens;
        exports.compose = compose;
        exports.chain = chain;
        exports.traversal = traversal;
        class Optic {
            constructor(fun) {
                this.exec = fun;
            }
        }
        const id = id => id;
        let view = exports.view = ((optic, target) => {
            if (optic instanceof Optic) {
                return optic.exec(target);
            } else {
                return compose(optic).exec(target);
            }
        });
        function trusted(operation) {
            return new Optic((target, itr) => {
                let {done: done, value: value} = itr ? itr.next() : {
                    done: true
                };
                if (done) {
                    return operation(target, id);
                } else {
                    return operation(target, target => value.exec(target, itr));
                }
            });
        }
        function optic(operation) {
            return new Optic((target, itr) => {
                let {done: done, value: value} = itr ? itr.next() : {
                    done: true
                };
                if (done) {
                    return operation(target, id);
                } else {
                    let safe = true;
                    let next = target => {
                        if (safe) {
                            safe = false;
                        } else {
                            throw `The 'next' function was called twice; for library performance, optics calling 'next' more than once must be created with 'traversal' in place of 'optic'`;
                        }
                        return value.exec(target, itr);
                    };
                    let ret = operation(target, next);
                    if (itr.return) {
                        itr.return();
                    }
                    return ret;
                }
            });
        }
        function lens(distort, correct) {
            return trusted((o, n) => correct(o, n(distort(o))), false);
        }
        function compile(optics) {
            return optics.map(l => {
                if (typeof l === "string" || typeof l === "number") {
                    return pluck(l);
                } else if (l instanceof Array) {
                    return compose(...l);
                } else if (l instanceof Function) {
                    return trusted((target, next) => {
                        return next(l(target));
                    });
                } else {
                    return l;
                }
            });
        }
        function compose(...optics) {
            let lst = compile(optics);
            let itr = lst[Symbol.iterator]();
            itr.next();
            return new Optic((target, i) => {
                let ret = lst[0].exec(target, function*() {
                    yield* itr;
                    if (i !== undefined) {
                        yield* i;
                    }
                }());
                if (itr.return) {
                    itr.return();
                }
                return ret;
            });
        }
        function chain(...optics) {
            return trusted((target, next) => {
                return next(compile(optics).reduce((acc, optic) => {
                    return view(optic, acc);
                }, target));
            }, false);
        }
        let pluck = exports.pluck = (mem => lens(obj => obj[mem], (obj, val) => {
            if (obj[mem] === val) {
                return obj;
            } else {
                let r = obj instanceof Array ? obj.map(i => i) : Object.assign({}, obj);
                if (typeof mem === "number" && !obj instanceof Array) {
                    throw new Error("The 'pluck' lens will not assign numeric member keys to non-Arrays");
                }
                if (typeof mem === "string" && !obj instanceof Object) {
                    throw new Error("The 'pluck' lens will not assign string member keys to non-Objects");
                }
                r[mem] = val;
                return r;
            }
        }));
        let inject = exports.inject = ((prop, val) => lens(target => target, (target, ret) => {
            if (val === ret[prop]) {
                return target;
            } else {
                let r = Object.assign({}, ret);
                r[prop] = val;
                return r;
            }
        }));
        let remove = exports.remove = (prop => lens(obj => obj, (obj, ret) => {
            if (!prop in ret) {
                return ret;
            } else {
                let r = Object.assign({}, ret);
                delete r[prop];
                return r;
            }
        }));
        let where = exports.where = (predicate => {
            return optic((target, next) => {
                return predicate(target) ? next(target) : target;
            }, false);
        });
        function traversal(operation) {
            return new Optic((target, itr) => {
                let {done: done, value: value} = itr ? itr.next() : {
                    done: true
                };
                if (done) {
                    return operation(target, id => id);
                } else {
                    let lst = [];
                    while (!done) {
                        lst.push(value);
                        ({done: done, value: value} = itr.next());
                    }
                    let next = target => {
                        let itr = lst[Symbol.iterator]();
                        let {done: done, value: value} = itr.next();
                        let ret = done ? target : value.exec(target, itr);
                        if (itr.return) {
                            itr.return();
                        }
                        return ret;
                    };
                    return operation(target, next);
                }
            });
        }
        let each = exports.each = (() => {
            return traversal((target, next) => {
                let r;
                if (target instanceof Object) {
                    r = Object.keys(target).reduce((a, k) => {
                        a[k] = next(target[k]);
                        return a;
                    }, {});
                    return Object.keys(r).reduce((a, k) => {
                        return r[k] === a[k] ? a : r;
                    }, target);
                } else if (target instanceof Array) {
                    r = target.reduce((a, e, i) => {
                        a[i] = next(e);
                        return a;
                    }, []);
                    return r.reduce((a, e, i) => {
                        return e === a[i] ? a : r;
                    }, target);
                } else {
                    return target;
                }
            });
        });
        let join = pattern => {
            let index = -1;
            let input, output, result = {};
            let keys = Object.keys(pattern);
            return trusted((target, next) => {
                if (index < 0) {
                    input = target;
                    index += 1;
                } else if (index < keys.length) {
                    input[keys[index++]] = target;
                }
                if (index < keys.length) {
                    result[keys[index]] = next(input[keys[index]]);
                } else {
                    output = next(input);
                }
                return --index < 0 ? result : output[keys[index]];
            });
        };
        let parallelize = exports.parallelize = (pattern => {
            return new Optic((target, itr) => {
                let keys = Object.keys(pattern);
                let joiner = join(pattern);
                let r = compose(joiner, keys.map(k => [ pattern[k], joiner ])).exec(target, itr);
                return Object.keys(r).concat(keys).reduce((a, k) => {
                    return r[k] === a[k] ? a : r;
                }, target);
            });
        });
    } ]);
});