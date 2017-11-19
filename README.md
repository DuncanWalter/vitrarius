# **Vitrarius**

> **vitrarius:** a glassblower; one who works with glass

Vitrarius is a raw optics library for modern JavaScript. In the context of Redux, optics are useful as reducers. In general, optics are a utility to facilitate manipulating and interpretating nested data. They hail strict functional languages, so they are declarative and respect immutabilty. There are several formal implementations of optics in JavaScript already; in fact, if you are interested in optics from a pure perspective, I recommend checking them out [here](https://www.npmjs.com/package/partial.lenses). By comparison, Vitrarius is mathematically uncouth; it emphasizes flexibility and performance over purity. I chose the name Vitrarius to reflect the library's constructive approach to optics, and I try to live up to that meaning. Vitrarius can handle 'infinite' optics, build custom traversals, and will never pollute the call stack.

Out of the box, the optics of Vitrarius can handle Objects, Arrays, Maps, and many primitive values. To operate on other types (like those of ImmutableJS), vitrarius makes use of a container protocol. This protocol is similar to the iterator protocol, and allows vitrarius to gracefully handle any type of data. 

Vitrarius is __not__ intended to _replace_ more formal implementations, but rather to provide an idiomatic JavaScript alternative. 

While its API is minimal, Vitrarius bears the usual conceptual weight of optics; as consequence, it takes some effort to master.



### **Fundamental Usage**
--------------------

Vitrarius is a single module exporting several pure functions.

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

The constructive power of Vitrarius comes from the ability to define custom optics using the `compose` and `chain` optics. Vitrarius also supports a range of short-hands for working with otherwise cumbersome optics.

``` javascript
// most values in JavaScript can be interpreted as optics
let printName = compose('person', 'name', 'first', v => console.log(v));

view(printName, nestedPerson);
/* > 'Haskell' */
```

Advanced features include the infinite `cycle`, convenient `parallelize`, and magic `phantom` optics.


Examples and formal documentation coming soon! For now, refer to the [knarly use case vitrarius was built for](https://www.npmjs.com/package/silhouette).

