// an extensible type library used by vitrarius to
// perform custom operations. Allows for generalized
// traversals, clones, etc.
const types = new Map();

export function __define__(type, abstract){
    types.set(type, abstract);
};

const abstract = v => {
    let a = types.get(typeof v === 'object' ? v.constructor : undefined);
    if(a === undefined){ throw new Error('Untracked container type instance ' + v); }
    return a;
};

types.set(undefined, {
    clone: i => i,
    get: v => console.log('PRIMITIVE GET', v),
    set: v => console.log('PRIMITIVE SET', v),
    members: v => console.log('PRIMITIVE MEMBERS', v),
    remove: v => console.log('PRIMITIVE REMOVE', v),
});

types.set(Object, {
    clone: o => Object.assign({}, o),
    get: (o, m) => o[m],
    set(o, m, v){ o[m] = v; },
    members: v => Object.keys(v),
    remove(o, m){ delete o[m]; },
});

types.set(Array, {
    clone: a => a.map(i => i),
    get: (a, i) => a[i],
    set(a, i, v){ a[i] = v; },
    members: v => Object.keys(v),
    remove(a, k){ a.splice(k, 1); },
});

export const __members__ = d => abstract(d).members(d);
export const __clone__ = d => abstract(d).clone(d);
export const __get__ = (o, m) => abstract(o).get(o, m);
export const __set__ = (o, m, v) => abstract(o).set(o, m, v);
export const __remove__ = (o, m) => abstract(o).remove(o, m);