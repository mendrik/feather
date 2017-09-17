module.exports = {
  plugins: [
    require('stylelint'),
    require('postcss-import')({}),
    require('postcss-mixins')({}),
    require('postcss-math')({}),
    require('precss')({}),
    require('postcss-custom-properties')({}),
    require('postcss-discard-comments')({}),
    require('autoprefixer')({}),
    require('postcss-clean')({})
  ]
}
