# Execute As Promise (executeAsPromise)

_executeAsPromise_ is a simple package that allows you to execute any function as if it were a `Promise` (even if it isn't!).

This can be useful when you don't know in advance whether a function will be a `Promise` or not, but still want to keep a
clean `then().catch()`-chain in your code.

_executeAsPromise_ works by executing the function that is being passed, and then evaluating the result.

If it _looks_ like a `Promise` it will return the Promise itself. If the function result _doesn't look_ like a `Promise`,
it will wrap it inside a `new Promise` and return that instead.

## Installation

Install _executeAsPromise_ through NPM:

```sh
npm install @michieljs/execute-as-promise
```

## Usage

Import _executeAsPromise_ in your code:

```js
import executeAsPromise from '@michieljs/execute-as-promise'
```

Next you can use it in your code:

```js
const normalFunction = () => {
  return 'my result'
}

executeAsPromise(normalFunction).then(console.log)

const promiseFunction = new Promise((resolve, reject) => {
  let rand = Math.random()
  if (rand >= 0.5) {
    resolve('Failure')
  } else {
    reject('Success!')
  }
})

executeAsPromise(promiseFunction)
  .then(console.log)
  .catch(console.error)

const valueNotAFunctionAtAll = 10

executeAsPromise(valueNotAFunctionAtAll).then(console.log)
```

The `executeAsPromise`-method accepts 3 parameters:

- function to execute (a `Promise`, a normal `Function` or even a `String` or `Number`)
- array of arguments to be `apply`-ed to the function (optional, defaults to `null`)
- context (or scope) for the function execution (optional, default to `null`)

```js
const fullName = function(firstName, lastName) {
  return firstName + ' ' + lastName
}

executeAsPromise(myFunction, ['John', 'Doe])
```


## Tests

To execute the unit tests run:

```sh
npm run test
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) Michiel van der Geest
