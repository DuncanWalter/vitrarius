# **Vitrarius**

> **vitrarius:** a glassblower; one who works with glass

 Vitrarius is a raw optics library designed to handle and exploit the quirks of JavaScript. Optics are a utility pattern used to facilitate manipulations and interpretations of nested data. They hail mostly from functional languages which make heavy use of immutable data structures, so they are well defined and declarative. There are several formal implementations of optics in JavaScript already. In fact, if you are interested in optics from an academic perspective, I recommend checking them out [here](https://www.npmjs.com/package/partial.lenses). 
 
 Vitrarius, on the other hand, is an optics library implemented by a mad scientist to solve an engineering problem; it's a bit uncouth, but also wicked powerful. Vitrarius generalizes optics for side effects, mutations, plurality, recursion, and arbitrary combinations thereof. Its name was chosen to reflect the library's less strict, more constructive approach to optics in JavaScript. Vitrarius is __not__ intended to _replace_ more formal implementations, but rather to provide a utilitarian alternative. While its API is light, vitrarius bears all the conceptual weight of optics; it takes effort to master.

### **Fundamental Usage**
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
// default optics treat objects as immutables
console.log(object);
/* > { } */

// so shallow comparisons are safe 
console.log(person === object);
/* > false */

// though unchanged objects are preserved
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

There are more optic-crafting functions in Vitrarius, some of which are discussed below.

### **Advanced Features**
----------------
Vitrarius also has chain, parallelize, optic, lens, and traversal functions for crafting specialized tools. So far, the most powerful features of vitrarius are probably the parallelize and traversal functions. Parallelize allows lenses to be used in parallel on properties of an object in a naturally composable manner. This greatly simplifies specifying side effects or using a mediator inside optics. Traversal creates a custom optic which can operate on multiple targets. These shine when working with arrays or recursion. These two functions, along with compose, represent most of the complexity behind vitrarius.

Examples coming soon! For now, refer to the [knarly use case vitrarius was built for](https://www.npmjs.com/package/silhouette).

