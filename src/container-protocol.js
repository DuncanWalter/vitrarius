// an extensible type library used by vitrarius to
// perform custom operations. Allows for generalized
// traversals, clones, etc.

// The container protocol is defined as
// the iterator protocol is.
Symbol.container = Symbol('container');

// TODO: define container behaviors for symbols, typed arrays, Sets, etc

// TODO: containers cannot contain undefined, but call contain null. 

// need members, get, set, (cut, has, create, clone)

// is null an empty container? Yes. Yes it is.

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
Function.prototype[Symbol.container] = primitiveProtocol;

Object.prototype[Symbol.container] = {
    clone: o => Object.assign({}, o),
    get: (o, m) => o[m],
    set(o, m, v){ o[m] = v; },
    members: v => Reflect.ownKeys(v),
    cut(o, m){ delete o[m]; },
    has: (o, m) => o.hasOwnProperty(m),
};

Array.prototype[Symbol.container] = {
    get: (a, i) => a[i],
    set(a, i, v){ a[i] = v; },
    members: v => Object.keys(v),
    cut(a, k){ a.splice(k, 1); },
};
Int8Array.prototype[Symbol.container] = Array.prototype[Symbol.container];

Map.prototype[Symbol.container] = {
    get: (m, k) => m.get(k),
    set(m, k, v){ m.set(k, v); },
    members: m => m.keys(),
    cut(m, k){ m.delete(k); },
    has: (m, k) => m.has(k),
};

// underivable. return an array of member keys.
export const members = o => o !== null ? o[Symbol.container].members(o) : [];

// underivable. return either the value at the given member key or undefined.
export const get = (o, m) => o !== null ? o[Symbol.container].get(o, m) : undefined;

// underivable. fall back to cut if setting undefined.
export const set = (o, m, v) => {
    if(o !== null){
        if(v ===  undefined && o[Symbol.container].cut){
            o[Symbol.container].cut(o, m);
        } else {
            o[Symbol.container].set(o, m, v);
        }
    }
}

// if undefined, derive from set undefined
export const cut = (o, m) => {
    if(o !== null){
        if(o[Symbol.container].cut){
            o[Symbol.container].cut(o, m);
        } else {
            o[Symbol.container].set(o, m, undefined);
        }
    }
}

// derivable from get. return boolean.
export const has = (o, m) => {
    if(o !== null){
        if(o[Symbol.container].has){
            return o[Symbol.container].has(o, m);
        } else {
            return o[Symbol.container].get(o, m) !== undefined;
        }
    } else {
        return false;
    }
};

// derivable (probably)
export const create = o => {
    if(o === null){ 
        return undefined; 
    } else if(o[Symbol.container].create){
        return o[Symbol.container].create(o);
    } else {
        return new o.constructor();
    } 
}

// derivable from members, get, and set
export const clone = o => {
    if(o === null){ 
        return undefined; 
    } else if(o[Symbol.container].clone){
        return o[Symbol.container].clone(o);
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