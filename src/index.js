import ListZipper from './ListZipper'
import { __get__, __set__, __clone__, __members__, __remove__ } from './abstraction'

// acquire a public reference to use for type detection
const GeneratorFunction = (function*(){}).constructor;

// TODO isolate this as a handler factory. Could have factory versions.
// an independent state container for efficiently
// catching errors and throwing them back up the
// chain of lenses


function submit(...args){
    handler.next(args);
}


function HandlerContext(){

    const hg = function*(){
        let generator, target, result;
        // while(true){ // TODO either enable error context or remove the handler? Could make this a debug mode?
        //     try {
        while(true){
            ([ generator, target, result ] = yield);
            Object.assign(result, generator.next(target));
        }
        //     } catch(err) {
        //         done = true;
        //         value = err;
        //     }
        // }
    };

    let sequence = new ListZipper();
    sequence.push(hg());

    return {
        submit(...args){
            if(!sequence.head.value){ sequence.push(hg()); }
            let freeHandler = sequence.head.value;
            sequence.shift();
            freeHandler.next(args) 
            sequence.unShift();
        },
    };
};

const context = new HandlerContext();

export let view = optic => target => {

    let sequence = new ListZipper();

    if(optic instanceof GeneratorFunction){
        sequence.add({ optic, generator: undefined });
    } else {
        for(let o of optic){
            sequence.add({ optic: o, generator: undefined });
        }
    }

    let focus = sequence.head.value;
    focus.generator = focus.optic(target);

    let result = {
        value: target,
        done: false,
    }

    while(!result.done){
        context.submit(focus.generator, result.value, result);
        if(!result.done){
            focus = sequence.shift();
            if(focus){
                focus.generator = focus.optic(result.value);
            } else {
                focus = sequence.unShift();
            }
        } else {
            focus.generator = undefined;
            focus = sequence.unShift();
            result.done = focus === undefined;
        }
    }
    
    return result.value;
};

// allows for the use of short-hands when constructing
// complex optics using compose (and eventually sequence)
function compile(optics){
    return optics.map(l => {
        if(typeof l === 'string' || typeof l === 'number'){
            return pluck(l);
        } else if(l instanceof Array){
            return compose(...l);
        } else if(l instanceof GeneratorFunction){
            return l;
        } else if(l instanceof Function){
            return function*(t){ return yield l(t); }
        } else if(l[Symbol.iterator]){
            return l;
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


export let lens = (i, o) => function*(v){ 
    return o(yield i(v)); 
};


export let pluck = m => function*(v){ 
    let mem = __get__(v, m);
    let ret = yield mem;
    if(ret === undefined){ console.log('pluck result', ret); };
    if(ret === mem){
        return v;
    } else {
        let fin = __clone__(v);
        __set__(fin, m, ret);
        return fin;
    }
};


export let inject = (member, fragment) => function*(target){ 
    let result = yield target;
    if(result === undefined){ console.log('inject result', result); };
    if(__get__(result, member) === fragment){
        return result;
    } else {
       if(result === target){
           result = __clone__(target);
       }
       __set__(result, member, fragment);
       return result;
    }
};


export let remove = member => function*(target){ 
    let result = yield target;
    if(result === undefined){ console.log('remove result', result); };
    if(__get__(result, member) === undefined){
        return result;
    } else {
        if(result === target){
            result = __clone__(target);
        }
        __remove__(result, member);
        return result;
    }
};


export let each = () => function*(target){
    let acc = target;
    if(target === undefined){ console.log('each undefined', target);  };
    for(let m of __members__(target)){
        let result = __get__(target, m);
        let fragment = yield result;
        if(result !== fragment){
            if(acc === target){
                acc = __clone__(acc);
            }
            __set__(acc, m, fragment);
        }
    };
    return acc;
};


export let where = predicate => function*(v){
    return predicate(v) ? yield v : v;
};


export let handle = handler => function*(v){
    let r = yield v;
    return r instanceof Error ? handler(r) : r;
};


// TODO this is hacked in as an afterthought which defeats the logging improvements
export let chain = (...optics) => function*(v){
    return compile(optics).reduce((a, o) => view(o)(a), yield v);
}

















































// export let each = () => {
//     return traversal((target, next) => {
//         let r;
//         if(target instanceof Array){
//             r = target.reduce((a, e, i) => {
//                 a[i] = next(e);
//                 return a;
//             }, []);
//             return r.reduce((a, e, i) => {
//                 return e === a[i] ? a : r;
//             }, target);
//         } else if(target instanceof Object){
//             r = Object.keys(target).reduce((a, k) => {
//                 a[k] = next(target[k]);
//                 return a;
//             }, {});
//             return Object.keys(r).reduce((a, k) => {
//                 return r[k] === a[k] ? a : r;
//             }, target);
//         } else {
//             return target;
//         }
//     });
// }

// let join = pattern => {
//     let index = -1;
//     let input, output, result = {};
//     let keys = Object.keys(pattern);
//     return trusted((target, next) => {

//         if(index < 0){ 
//             input = target;
//             index += 1;
//         } else if(index < keys.length){
//             input[keys[index++]] = target;
//         }

//         if(index < keys.length){
//             result[keys[index]] = next(input[keys[index]]);
//         } else {
//             output = next(input);
//         }

//         // console.log(output);

//         return --index < 0 ? result : output[keys[index]];

//     });
// }

// export let parallelize = pattern => {
//     return new Optic((target, itr) => {
//         let keys = Object.keys(pattern);
//         let joiner = join(pattern);
//         let r = compose(joiner, keys.map(k => [pattern[k], joiner])).exec(target, itr);
//         return Object.keys(r).concat(keys).reduce((a, k) => {
//             return r[k] === a[k] ? a : r;
//         }, target);
//     });
// }

// export function chain(...optics){
//     return trusted((target, next) => {
//         return next(compile(optics).reduce((acc, optic) => {
//             return view(optic, acc);
//         }, target));
//     }, false);
// }