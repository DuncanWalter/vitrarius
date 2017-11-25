# **Container Protocol**
 

The container protocol allows JavaScript values to define or customize their behavior as containers, such as when `Objects` are used as `Maps`. Most built in types have a default container behavior, including primitive values and `null`. The container protocol is designed to mimic the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). Any value with a `@@container` prototype (defined using the globally available `Symbol.container`) may be used as a container. Additionally, `null` is defined to be the empty container. Container prototypes must define `get`, `set`, and `members` methods, and may also overwrite derived methods including `has`, `cut`, `clone`, and `create`. A container is defined as any value which can store and access defined values using keys. True containers may not store `undefined` as a value. 

Functions exported by `container-protocol` include the following, where `t` is any container:

- `get(t, k)` :: Gets the value stored in `t` at key `k`. `get(t, k)` is an idempotent operation. 
- `has(t, k)` :: Returns a boolean describing whether `t` has a value stored under the key `k`. `has(t, k)` is defined to be equivalent to `(get(t, k) !== undefined)`.
- `set(t, k, v)` :: Stores the value `v` in `t` under the key `k`. If `v` is `undefined`, `set(t, k, v)` defaults to the behavior of `cut(t, k)` if `cut(t, k)` is defined.
- `cut(t, k)` :: Removes the value stored in `t` under the key `k`. Note that this does not necessarily remove the key `k` from `members(t)`. `cut(t, k)` is defined to be equivalent to `set(t, k, undefined)`.
- `members(t)` :: Returns an iterable list of keys in `t` under which values are stored. `members(t)` is an idempotent operation.
- `clone(t)` :: Returns a container of the same type as `t` with identical keys and values. `clone(t)` is usually derivable, and is an idempotent operation.  
- `create(t)` :: Returns a container of the same type as `t` which contains no values. `create(t)` is usually derivable, and is an idempotent operation.
- `Container(t)` :: A factory function returning an object with all of the above operations defined in addition to `map`, `filter`, `reduce`, and `forEach`. The raw container instance used to create a `Container` can be accessed using the `Symbol.container` property on the `Container`.

`container-protocol` provides a way to make libraries type agnostic, as container behaviors can be defined on most types to serve a wide variety of purposes. 


