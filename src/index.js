import ListZipper from './ListZipper'
import Container, { get, set, clone, members, cut } from './container-protocol'
export { Container }

// acquire a public reference to use for type detection
const GeneratorFunction = (function*(){}).constructor;



// const context = new HandlerContext();

export let view = (...args) => {

    let target = args.pop();
    let optic = args.length === 1 ? args[0] : compose(args);

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
        // context.submit(focus.generator, result.value, result);
        Object.assign(result, focus.generator.next(result.value));
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
            return function* optic(t){ return yield l(t); }
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


export let lens = (i, o) => function* lens(v){ 
    return o(yield i(v)); 
};


export let pluck = m => function* pluck(v){ 
    let mem = get(v, m);
    let ret = yield mem;
    if(ret === undefined){ console.log('pluck result', ret); };
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
    if(result === undefined){ console.log('inject result', result); };
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
    if(result === undefined){ console.log('remove result', result); };
    if(get(result, member) === undefined){ // TODO: technically non-deterministic between undefined cases
        return result;
    } else {
        if(result === target){
            result = clone(target);
        }
        cut(result, member);
        return result;
    }
};


export let each = () => function* each(target){
    let acc = target;
    if(target === undefined){ console.log('each undefined', target);  };
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
    return predicate(v) ? yield v : v;
};


// 


// TODO: this is hacked in as an afterthought which defeats the logging improvements
// tie into the core build somehow...
export let chain = (...optics) => function* chain(v){
    return compile(optics).reduce((a, o) => view(o, a), yield v);
}





// export let handle = handler => function* handle(v){
//     let r = yield v;
//     return r instanceof Error ? handler(r) : r;
// };


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
// };







// // an independent state container for efficiently
// // catching errors and throwing them back up the
// // chain of lenses
// function HandlerContext(){

//     const hg = function* vitrarius_context(){
//         let generator, target, result;
//         while(true){ // TODO: either enable error context or remove the handler? Could make this a debug mode?
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