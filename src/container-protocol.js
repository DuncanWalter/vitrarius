// an extensible type library used by vitrarius to
// perform custom operations. Allows for generalized
// traversals, clones, etc.
const types = new Map();

export function define(type, abstract){
    types.set(type, Object.assign(types.get(type) || {}, abstract));
};

const abstract = v => {
    let a = types.get(typeof v === 'object' ? v.constructor : undefined);
    if(a === undefined){ throw new Error('Untracked container type instance ' + v); }
    return a;
};

types.set(undefined, {
    clone: i => i,
});

types.set(Object, {
    clone: o => Object.assign({}, o),
    get: (o, m) => o[m],
    set(o, m, v){ o[m] = v; },
    members: v => Object.keys(v),
    cut(o, m){ delete o[m]; },
});

types.set(Array, {
    clone: a => a.map(i => i),
    get: (a, i) => a[i],
    set(a, i, v){ a[i] = v; },
    members: v => Object.keys(v),
    cut(a, k){ a.splice(k, 1); },
});

types.set(Map, {
    clone(m){
        let r = new Map();
        m.forEach((v, k) => r.set(k, v));
        return r;
    },
    get: (m, k) => m.get(k),
    set(m, k, v){ m.set(k, v); },
    members: m => m.keys(),
    cut(m, k){ m.delete(k); },
});

export const members = o => abstract(o).members(o);
export const clone = o => abstract(o).clone(o);
export const get = (o, m) => abstract(o).get(o, m);
export const set = (o, m, v) => abstract(o).set(o, m, v);
export const cut = (o, m) => abstract(o).cut(o, m);