print = global.print = (...args) => {
  console.log(...args)
  //console.log(...args.map(a => JSON.stringify(a)))
}

// see https://github.com/avajs/ava/blob/master/docs/recipes/browser-testing.md
require("browser-env")()
