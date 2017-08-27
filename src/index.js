

// TODO make an LL scanner (two linked lists in opposite directions) class to replace iterators.
// TODO make lenses into classless generators
// TODO implement a lens housing which handles 'generalized' recursion





class Optic {
    constructor(fun){
        this.exec = fun;
    }
}

const id = id => id;

// view is used to activate optics
export let view = (optic, target) => {
    if(optic instanceof Optic){
        return optic.exec(target);
    } else {
        return compose(optic).exec(target);
    }
}

// if an optic will be provably safe, then it will be created by the
// trusted pseudo-constructor to maximize performance.
function trusted(operation){
    return new Optic((target, itr) => {
        let { done, value } = itr ? itr.next() : { done: true };
        if(done){
            return operation(target, id);
        } else {
            return operation(target, target => value.exec(target, itr));
        }
    });
}

// Next :: Object? -> Object?
// Optic :: { exec :: (Object?, Iterator<Optic>) -> Object? }
// optic :: ( ( Object, Next ) -> void, false ) ->  Optic
export function optic(operation){
    return new Optic((target, itr) => {
        let { done, value } = itr ? itr.next() : { done: true };
        if(done){
            return operation(target, id);
        } else {
            let safe = true;
            let next = target => {
                if(safe){ safe = false } else { throw `The 'next' function was called twice; for library performance, optics calling 'next' more than once must be created with 'traversal' in place of 'optic'` }
                return value.exec(target, itr);
            }
            let ret = operation(target, next);
            if(itr.return){ itr.return(); }
            return ret;
        }
    });
}

// lens is a functional pseudo-constructor for making custom optics.
// Lenses are a subset of all optics which select and/or modify a single target
// without any inverse property. When composed with other optics, a custom
// lens' distort function provides data to subsequent lenses, while its correct 
// function provides the final output of the lens.
//
// lens :: (Object -> Object, (Object, Object) -> Object) -> Optic
export function lens(distort, correct){
    return trusted((o, n) => correct(o, n(distort(o))), false);
}

function compile(optics){
    return optics.map(l => {
        if(typeof l === 'string' || typeof l === 'number'){
            return pluck(l);
        } else if(l instanceof Array){
            return compose(...l);
        } else if(l instanceof Function){
            return trusted((target, next) => {
                return next(l(target));
            });
        } else {
            return l;
        }
    });
}

// compose converts a sequence of optics into a single optic. compose also
// supports several short-hands: numbers and strings will be converted to
// pluck lenses while nested arrays will be recursively composed. Most
// interestingly, functions will be converted into simple optics. This
// can be used to declaratively define recursive optics.
export function compose(...optics){
    let lst = compile(optics);

    let itr = lst[Symbol.iterator]();
    itr.next();

    return new Optic((target, i) => {
        let ret = lst[0].exec(target, (function*(){
            yield* itr;
            if(i !== undefined){ yield* i; }
        })());
        if(itr.return){ itr.return(); }
        return ret;
    });
    
}

export function chain(...optics){
    return trusted((target, next) => {
        return next(compile(optics).reduce((acc, optic) => {
            return view(optic, acc);
        }, target));
    }, false);
}

// pluck is a functional pseudo-constructor for perhaps the most common lens.
// pluck accepts either a string or a number to use as a member key. Subsequent lenses
// will view only the member specified by that key. The pluck lens itself supports
// efficient immutability, and will not mutate any inputs.
export let pluck = mem => lens(obj => obj[mem], (obj, val) => {
    if(obj[mem] === val){
        return obj;
    } else {
        let r = obj instanceof Array ? obj.map(i => i) : Object.assign({}, obj);
        if(typeof mem === 'number' && !obj instanceof Array){
            throw new Error("The 'pluck' lens will not assign numeric member keys to non-Arrays");
        }
        if(typeof mem === 'string' && !obj instanceof Object){
            throw new Error("The 'pluck' lens will not assign string member keys to non-Objects");
        }
        r[mem] = val;
        return r;
    }
});

// inject is a functional pseudo-constructor for the additive mutation lense.
// inject accepts either a string or a number to use as a member key and a value to insert. 
// The inject lens itself supports efficient immutability, and will not mutate any inputs.
export let inject = (prop, val) => lens(target => target, (target, ret) => {
    if(val === ret[prop]){
        return target;
    } else {
        // TODO catch array cases
        let r = Object.assign({}, ret);
        r[prop] = val;
        return r;
    }
});

// remove is a functional pseudo-constructor for the negative mutation lense.
// remove accepts either a string or a number to use as a member key. 
// The remove lens itself supports efficient immutability, and will not mutate any inputs.
export let remove = prop => lens(obj => obj, (obj, ret) => {
    if(!prop in ret){
        return ret;
    } else {
        let r = Object.assign({}, ret);
        delete r[prop];
        return r;
    }
});

// where is a functional pseudo-constructor for optics which act as if blocks.
// where accepts a predicate function which returns a boolean flag. If the
// predicate run over an input returns false, no subsequent composed lenses will be used.
export let where = predicate => {
    return optic((target, next) => {
        return predicate(target) ? next(target) : target;
    }, false);
}

export function traversal(operation){
    return new Optic((target, itr) => {
        let { done, value } = itr ? itr.next() : { done: true };
        if(done){
            return operation(target, id => id);
        } else {
            let lst = [];
            while(!done){
                lst.push(value); 
                ({ done, value } = itr.next());
            }
            let next = target => {
                let itr = lst[Symbol.iterator]();
                let { done, value } = itr.next();
                let ret = done ? target : value.exec(target, itr);
                if(itr.return){ itr.return(); }
                return ret;
            }
            return operation(target, next);
        }
    });
}

// 
export let each = () => {
    return traversal((target, next) => {
        let r;
        if(target instanceof Array){
            r = target.reduce((a, e, i) => {
                a[i] = next(e);
                return a;
            }, []);
            return r.reduce((a, e, i) => {
                return e === a[i] ? a : r;
            }, target);
        } else if(target instanceof Object){
            r = Object.keys(target).reduce((a, k) => {
                a[k] = next(target[k]);
                return a;
            }, {});
            return Object.keys(r).reduce((a, k) => {
                return r[k] === a[k] ? a : r;
            }, target);
        } else {
            return target;
        }
    });
}

let join = pattern => {
    let index = -1;
    let input, output, result = {};
    let keys = Object.keys(pattern);
    return trusted((target, next) => {

        if(index < 0){ 
            input = target;
            index += 1;
        } else if(index < keys.length){
            input[keys[index++]] = target;
        }

        if(index < keys.length){
            result[keys[index]] = next(input[keys[index]]);
        } else {
            output = next(input);
        }

        // console.log(output);

        return --index < 0 ? result : output[keys[index]];

    });
}

export let parallelize = pattern => {
    return new Optic((target, itr) => {
        let keys = Object.keys(pattern);
        let joiner = join(pattern);
        let r = compose(joiner, keys.map(k => [pattern[k], joiner])).exec(target, itr);
        return Object.keys(r).concat(keys).reduce((a, k) => {
            return r[k] === a[k] ? a : r;
        }, target);
    });
}


