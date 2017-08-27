import * as optics from './index.js'
import tap from 'tap'
let { view, optic, inject, remove, compose, chain, parallelize, lens, each } = optics;

var a3 = {a: 3};
var a5 = {a: 5};
var b3 = {b: 3};
var b0a = {b: ['a']};
var inja5 = inject('a', 5);
var rema = remove('a');

tap.test('> optics tests', t => {
    t.deepEqual(view(inja5, a3), a5); // injector
    t.deepEqual(view(rema, a3), {}); // remover
    t.deepEqual(view(compose(rema, inja5), b3), b3); // composition
    t.deepEqual(view(compose(inja5, ['b', i => i, rema]), {b:a3}), {a: 5, b: {}}); // short-hands
    t.deepEqual(view(compose(each(), inja5), {b:{}, c:{}}), {b:{a:5}, c:{a:5}}); // traversal / each
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
    console.log(view(compose('b', each(), v => 3), b0a));

    t.end();
});




