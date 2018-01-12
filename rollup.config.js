import jsx from "rollup-plugin-jsx"

// in package.json scripts:
// "bundle-rollup": " rollup src/examples/kdtree/example.js --o dist/bundle.js -m --f iife -c rollup.config.js"
// ... did have many problems with parsing when JSX plugin was active, so webpack seems better for now

export default {
  plugins: [
    jsx({factory: 'h'})
  ]
}
