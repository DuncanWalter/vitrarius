# **Vitrarius**

> **vitrarius:** a glassblower; one who works with glass

Vitrarius is a raw optics library for modern JavaScript. In the context of Redux, optics are useful as reducers. In general, optics are a utility that facilitates manipulating and interpretating nested data. They hail from functional languages, so they are declarative and respect immutabilty. There are several formal implementations of optics in JavaScript already; in fact, if you are interested in optics from a pure perspective, I recommend checking them out [here](https://www.npmjs.com/package/partial.lenses). By comparison, Vitrarius is uncouth; it emphasizes flexibility and performance over purity. Its name was chosen to reflect the library's constructive approach to optics. 

Out of the box, the optics of Vitrarius can handle Objects, Arrays, Maps, and many primitive values. To operate on other types (like those of ImmutableJS), vitrarius makes use of a container protocol. This protocol is similar to the iterator protocol, and allows vitrarius to gracefully handle any type of data. 

Vitrarius is __not__ intended to _replace_ more formal implementations, but rather to provide an idiomatic JavaScript alternative. 

While its API is minimal, Vitrarius bears the usual conceptual weight of optics; as consequence, it takes some effort to master.



### **Fundamental Usage**
--------------------

Vitrarius is a single module exporting several pure functions. It is designed for use with es2015 language features, so examples will use es2015 syntax.

``` javascript
import { view, pluck, inject, compose } from 'vitrarius'
```

Optics are executed using the `view` function once created.

``` javascript
let object = {};

// create an optic
let exampleOptic = inject('name', {
    first: 'Haskell',
    last: 'Curry',
});

// execute the optic
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
console.log(person === object);
/* > false */

// Unchanged objects are preserved
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

There are several built in optics. `pluck` peers into containers as demonstrated above. `inject` adds information to targets, while `remove` deletes information. `handle` safely deals with errors where nessessary. There are also `each` and `where` optics for use on collections and ill-formatted data respectively.

The real power of vitrarius, however, comes from the ability to define custom optics using `composing` and `sequence` optics. Vitrarius also supports a range of short-hands for working with otherwise cumbersome optics.

``` javascript
// strings, numbers, functions, and arrays can be used as optics
let printName = compose('person', 'name', 'first', v => console.log(v));

view(printName, nestedPerson);
/* > 'Haskell' */
```

Examples and formal documentation coming soon! For now, refer to the [knarly use case vitrarius was built for](https://www.npmjs.com/package/silhouette).

