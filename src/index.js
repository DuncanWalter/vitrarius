import IterableZipper from './IterableZipper'
import Container, { get, set, clone, has, members, cut, create } from './container-protocol'
export { Container }

// acquire a public reference to use for type detection
const GeneratorFunction = (function*(){}).constructor;



// const context = new HandlerContext();

// TODO: un-recurse sequencing 
export let view = new Proxy((...args) => {

    let target = args.pop();
    let sequence = new IterableZipper(compose(args));

    let focus = sequence.proxy();
    focus.gen = focus.value(target);

    
    let value = target;
    let done = false;
    

    while(!done){
        ({ value, done } = focus.gen.next(value));
        if(!done){
            if(sequence.hasNext()){
                sequence.next();
                focus.gen = focus.value(value);
            }
        } else {
            focus.gen = undefined;
            sequence.back();
            done = sequence.tail == undefined;
        }    
    }
    
    sequence.return();
    return value;
}, {
    get(trg, mem){
        return (...args) => trg(mem, ...args);
    }
});

// allows for the use of short-hands when constructing
// complex optics using compose (and eventually sequence)
// TODO: add objects for splitting optics by key
function compile(optics){
    return optics.map(l => {
        if(typeof l != 'function' && typeof l != 'object'){
            return pluck(l);
        } else if(l instanceof Array){
            return compose(...l);
        } else if(l instanceof GeneratorFunction){
            return l;
        } else if(l instanceof Function){
            return function* optic(t){ return yield l(t); }
        } else if(l[Symbol.iterator]){
            return l;
        } else if(l[Symbol.container]){
            return parallelize(l);
        } else {
            throw Error('Invalid optic type instance ' + l);
        }
    });
};


export let compose = (...optics) => {
    return {
        [Symbol.iterator]: function*(){
            for(let o of compile(optics)){
                if(o instanceof GeneratorFunction){
                    yield o;
                } else if(o[Symbol.iterator]){
                    yield* o;
                } else {
                    throw Error('Invalid optic type instance ' + o);
                }
            }
        } 
    }
};


export let lens = (i, o) => function* lens(v){ 
    return o(v, yield i(v)); 
};

// TODO: create a path proxy alternative?
export let pluck = m => function* pluck(v){ 
    let mem = get(v, m);
    let ret = yield mem;
    if(ret === mem){
        return v;
    } else {
        let fin = clone(v);
        set(fin, m, ret);
        return fin;
    }
};


export let inject = (member, fragment) => function* inject(target){ 
    let result = yield target;
    if(get(result, member) === fragment){
        return result;
    } else {
       if(result === target){
           result = clone(target);
       }
       set(result, member, fragment);
       return result;
    }
};

export let remove = member => function* remove(target){ 
    let result = yield target;
    if(!has(result, member)){
        return result;
    } else {
        if(result === target){
            result = clone(target);
        }
        cut(result, member);
        return result;
    }
};

export let each = function* each(target){
    let acc = target;
    for(let m of members(target)){
        let result = get(target, m);
        let fragment = yield result;
        if(result !== fragment){
            if(acc === target){
                acc = clone(acc);
            }
            set(acc, m, fragment);
        }
    };
    return acc;
};

export let where = predicate => function* where(v){
    return predicate(v, this) ? yield v : v;
};

// TODO: this is hacked in as an afterthought which defeats the logging improvements
// tie into the core build somehow...
export let chain = (...optics) => function* chain(v){
    return compile(optics).reduce((a, o) => view(o, a), yield v);
};

export let cycle = (...optics) => { 
    return { 
        [Symbol.iterator]: function*(){
            while(true){
                yield* optics;
            }
        }, 
    }
};

// TODO: phantoms need to detect and not phantom
// already phantom items.
const __internal__ = Symbol('internal');
const del = Symbol('delete');
export let phantom = function* phantom(target){
    let context;
    yield (context = new (function Phantom(trg){
        let edits = clone(trg);
        return new Proxy(trg, {
            get(__, mem){
                if(mem === __internal__){  
                    let keys = members(edits);
                    return !keys.length ? trg : keys.reduce((a, k) => {
                        let c = get(edits, k);
                        set(a, k, c[__internal__] || c);
                        return a;
                    }, clone(trg));
                }
                return has(edits, mem) ? get(edits, mem) : new Phantom(get(target, mem));
            },
            set(__, mem, val){
                if(val !== get(target, mem)){
                    set(edits, mem, val[__internal__] || val);
                }
                return true;
            },
            apply(__, self, ...args){
                return target.call(self, ...args);
            },
            delete(__){
                // TODO: FIX THIS!!... not sure how though...
                // symbol for undefined
                throw new Error('vitrarius Phantom instances cannot delete properties');
            }
        });
    })(target));
    return context[__internal__];
};






// TODO: consider adding again by throwing exceptions into optics
// export let handle = handler => function* handle(v){
//     let r = yield v;
//     return r instanceof Error ? handler(r) : r;
// };



// --1---0---1---2---3-- ii
// ----o---o---o---o---- optics

let join = keys => {
    // 
    let decending, ascending, global, ii = -1;

    return function* join(target){

        if(ii < 0){ 
            global = target;
            decending = create(target);
            ascending = create(target);
        } else {
            set(decending, keys[ii], target);
        }

        if(++ii < keys.length){
            set(ascending, keys[ii], yield get(global, keys[ii]));
        } else {
            global = yield decending;
        }

        return (ii-- == 0) ? ascending : get(global, keys[ii]);

    };
};

export let parallel = pattern => {
    let keys = members(pattern);
    let joiner = join(keys);
    return compose(joiner, ...keys.map(k => [get(pattern, k), joiner]));
};







// // an independent state container for efficiently
// // catching errors and throwing them back up the
// // chain of lenses
// function HandlerContext(){

//     const hg = function* vitrarius_context(){
//         let generator, target, result;
//         while(true){
//             try {
//                 while(true){
//                     ([ generator, target, result ] = yield);
//                     Object.assign(result, generator.next(target));
//                 }
//             } catch(err) {
//                 result.done = true;
//                 result.value = err;
//             }
//         }
//     };

//     let sequence = new ListZipper();
//     sequence.push(hg());

//     return {
//         submit(...args){
//             if(!sequence.head.value){ sequence.push(hg()); }
//             let freeHandler = sequence.head.value;
//             sequence.shift();
//             freeHandler.next(args) 
//             sequence.unShift();
//         },
//     };
// };