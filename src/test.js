import * as optics from './index.js'
import tap from 'tap'
let { view, inject, remove, compose, each, lens, chain, parallelize, phantom } = optics;

let a3 = {a: 3};
let a5 = {a: 5};
let b3 = {b: 3};
let b0a = {b: ['a']};
let inja5 = inject('a', 5);
let rema = remove('a');

tap.test('> optics tests', t => {
    
    t.deepEqual(view(inja5, a3), a5); // injector
    t.deepEqual(view(rema, a3), {}); // remover
    t.deepEqual(view(compose(rema, inja5), b3), b3); // composition
    t.deepEqual(view(compose(inja5, ['b', i => i, rema]), {b:a3}), {a: 5, b: {}}); // short-hands
    t.deepEqual(view(compose(each(), inja5), {b:{}, c:{}}), {b:{a:5}, c:{a:5}}); // traversal // each
    t.deepEqual(view(chain(inja5, rema), b3), b3); // chains

    let ret = view(compose(parallelize({
        a: 'c', 
        b: 'd',
    }), trg => {
        /*/console.log(trg);/*/
        return {
            a: trg.a + 1, 
            b: trg.b,
        };
    }), {
        a: { c: 1 }, 
        b: { d: 3 },
    });
    t.deepEqual(ret, {a:{c: 2}, b:{d: 3}});

    t.true(view(compose('b', 0, v => 3), b0a).b instanceof Array);
    t.true(view(compose('b', each(), v => 3), b0a).b instanceof Array);

    t.true(view(phantom, v => { v.a = 3; v.b = 2; }, b3) != b3);
    t.deepEqual(view(phantom, v => { v.a = 3; v.b = 2; }, b3), {a:3,b:2});
    // console.log(view(compose('b', each(), v => 3), b0a));

    t.end();
    
});




