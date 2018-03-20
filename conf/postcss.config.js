module.exports = {
  plugins: [
    require('stylelint')({}),
    require('postcss-import')({}),
    require('postcss-mixins')({}),
    require('postcss-for')({}),
    require('postcss-nested')({}),
    require('postcss-cssnext')({}),
    require('postcss-calc')({}),
    require('postcss-simple-vars')({}),
    require('postcss-clean')({}),
  ]
}
