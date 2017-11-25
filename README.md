# **Vitrarius**

> **vitrarius:** a glassblower; one who works with glass

Vitrarius is a raw optics library for modern JavaScript. In the context of Redux, optics are useful as reducers. In general, optics are a utility to facilitate manipulating and interpretating nested data. They hail from strict, functional languages, so optics are declarative and respect immutability. There are several formal implementations of optics in JavaScript already; in fact, if you are interested in optics from a pure perspective, I recommend checking them out [here](https://www.npmjs.com/package/partial.lenses). By comparison, Vitrarius is mathematically uncouth; it emphasizes flexibility, performance, and traceability over purity.

Out of the box, the optics of Vitrarius can handle Objects, Arrays, Maps, and primitive values. To operate on other types (like those of ImmutableJS), vitrarius makes use of a container protocol. This protocol is similar to the iterator protocol, and allows vitrarius to gracefully handle any type of data. Documentation for the container protocol is coming soon.

Vitrarius is __not__ intended to _replace_ more formal implementations, but rather to provide an idiomatic JavaScript alternative.



### **Fundamental Usage**
--------------------

Vitrarius is a single module exporting several pure functions.

``` javascript
import { view, pluck, inject, compose } from 'vitrarius'
```

Optics are executed using the `view` function once created.

``` javascript
let object = {};

// create an optic to add
// a name property to targets
let exampleOptic = inject('name', {
    first: 'Haskell',
    last: 'Curry',
});

// execute the optic using view
let person = view(exampleOptic, object);

console.log(person);
/* > { name: { first: 'Haskell', last: 'Curry' } } */
```

Some things worth noting:

``` javascript
// default optics treat objects as immutables...
console.log(object);
/* > { } */

// ...so shallow comparisons are safe!
console.log(person !== object);
/* > true */

// unchanged objects are preserved
console.log(person === view(exampleOptic, person));
/* > true */
```

Working with nested data is a matter of composing multiple optics into one.

``` javascript
let nestedObject = { person: { } };

// combine a pluck optic with our old optic
let nestedOptic = compose(pluck('person'), exampleOptic);

// execute the nested optic as normal
let nestedPerson = view(nestedOptic, nestedObject);

console.log(nestedPerson);
/* > { person: { name: { first: 'Haskell', last: 'Curry' } } } */
```

There are several built in optics. `pluck` peers into containers as demonstrated above. `inject` adds information to targets, while `remove` deletes information. There are also `each` and `where` optics for use on collections and ill-formatted data respectively.

The constructive power of Vitrarius comes from the ability to define custom optics using the `compose`, `chain`, and `cycle` optics. Vitrarius also supports a range of short-hands for working with otherwise cumbersome optics.

``` javascript
// most values in JavaScript can be interpreted as optics
let printName = compose('person', 'name', 'first', console.log);

view(printName, nestedPerson);
/* > 'Haskell' */
```

Advanced features include the infinite `cycle`, convenient `parallel`, and magic `phantom` optics.

``` javascript
// An optic which recursively freezes
// a value (without polluting the call stack).
// Deep clones and traversals can be 
// similarly defined.
let deepFreeze = cycle(Object.freeze, each);

// Take a function which accepts a value
// and performs operations on it- return 
// an optic which performs that function 
// immutably using a proxy. 
let asImmutable = fun => compose(phantom, fun); 
```






Examples and formal documentation coming soon! For now, refer to the [knarly use case vitrarius was built for](https://www.npmjs.com/package/silhouette-core).

