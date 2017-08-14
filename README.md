# **Vitrarius**

> **vitrarius:** a glassblower; one who works with glass

 Optics are a utility pattern used to facilitate manipulations and interpretations of nested data. Optics hail mostly from functional languages which make heavy use of immutable data structures, so they are naturally well defined and declarative. There are several formal implementations of optics in JavaScript already. In fact, if you are interested in optics from an academic perspective, I recommend checking them out [here](www.https://npmjs/package/partial.lenses). 
 
 Vitrarius, on the other hand, is an optics library implemented by a mad scientist to solve an engineering problem; it's a bit uncouth, but also wicked powerful. Vitrarius exploits the freedoms of JavaScript to generalize optics for side effects, mutations, plurality, recursion, and arbitrary combinations thereof. Its name was chosen to reflect the library's less controlled (though perhaps more organic?) approach to optics in JavaScript. Vitrarius is __not__ intended to __replace__ more formal implementations, but rather to provide an alternative.

### **Introduction**
--------------------

Vitrarius is a single module exporting several pure functions. It is designed for use with es2015 language features, so examples will use es2015 syntax.

``` javascript
import { view, pluck, inject, compose } from 'vitrarius'
```

Optics are executed using the 'view' function once created.

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
// optics appear to have no properties
console.log(exampleOptic);
/* > Optic { } */

// default optics treat objects as immutables
console.log(object);
/* > { } */

// so shallow comparisons are safe 
console.log(person === object);
/* > false */

// even if there were no effective changes
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

There are several built in optics. Pluck peers into objects and arrays as demonstrated above. Inject adds information to targets, while remove does the opposite. There are also each and where optics for use on collections and ill-formatted data.

The real power of vitrarius, however, come from the ability to define custom optics. Vitrarius also supports a range of short-hands for working with otherwise cumbersome optics.

``` javascript
// strings, numbers, functions, and arrays can compile to optics
let printName = compose('person', 'name', 'first', v => console.log(v));

view(printName, nestedPerson);
/* > 'Haskell' */
```

Compose is just one way of building up optics. Vitrarius also has chain, optic, lens, and traversal functions for creating more nuanced optics.


### **Advanced**
----------------
Examples coming soon! For now, refer to the [knarly use case vitrarius was built for](www.https://npmjs/package/silhouette-store).