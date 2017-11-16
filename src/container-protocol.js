// an extensible type library used by vitrarius to
// perform custom operations. Allows for generalized
// traversals, clones, etc.

// The container protocol is defined as
// the iterator protocol is.
Symbol.container = Symbol('container');

// TODO: define container behaviors for symbols, typed arrays, Sets, etc


const primitiveProtocol = { 
    clone: o => o, 
    create: () => null,
    has: () => false,
    get: () => undefined,
    cut: () => undefined,
    set(){ throw new Error(`Primitive container ${o} cannot set members.`); },
    members: () => [],
};

Number.prototype[Symbol.container] = primitiveProtocol;
String.prototype[Symbol.container] = primitiveProtocol;
Boolean.prototype[Symbol.container] = primitiveProtocol;
Symbol.prototype[Symbol.container] = primitiveProtocol;

Object.prototype[Symbol.container] = {
    clone: o => Object.assign({}, o),
    get: (o, m) => o[m],
    set(o, m, v){ o[m] = v; },
    members: v => Object.keys(v),
    cut(o, m){ delete o[m]; },
    has: (o, m) => o.hasOwnProperty(m),
};

Array.prototype[Symbol.container] = {
    get: (a, i) => a[i],
    set(a, i, v){ a[i] = v; },
    members: v => Object.keys(v),
    cut(a, k){ a.splice(k, 1); },
    has: (a, i) => typeof i === 'number' && i < a.length,
};

Map.prototype[Symbol.container] = {
    get: (m, k) => m.get(k),
    set(m, k, v){ m.set(k, v); },
    members: m => m.keys(),
    cut(m, k){ m.delete(k); },
    has: (m, k) => m.has(k),
};

export const members = o => o[Symbol.container].members(o);

export const get = (o, m) => o[Symbol.container].get(o, m);
export const set = (o, m, v) => o[Symbol.container].set(o, m, v);
export const cut = (o, m) => o[Symbol.container].cut(o, m);
export const has = (o, m) => o[Symbol.container].has(o, m);

// derivable
export const create = o => {
    let c = o[Symbol.container].create;
    if(c){
        return c(o);
    } else {
        return new o.constructor();
    } 
}

// derivable from get and set
export const clone = o => {
    let c = o[Symbol.container].clone;
    if(c){
        return c(o);
    } else {
        let r = create(o);
        members(o).forEach(m => set(r, m, get(o, m)));
        return r;
    }
}

const Container = {
    get, 
    set, 
    cut, 
    has, 
    clone, 
    create, 
    members, 
    symbol: Symbol.container,
};

export default Container;