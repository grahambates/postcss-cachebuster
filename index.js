var url = require('url');
var fs = require('fs');

var postcss = require('postcss');
var path = require('canonical-path');

module.exports = postcss.plugin('postcss-cachebuster', function (opts) {
  opts = opts || {};
  opts.imagesPath = opts.imagesPath || '';

  return function (css) {

    var inputFile = css.source.input.file

    css.eachDecl(function(declaration){

      // only background-image declarations
      if (declaration.prop !== 'background-image') return;
      
      var assetUrl = url.parse(declaration.value.replace(/(url\(|\)|'|")/g,''));
      var inputPath = url.parse(inputFile);

      // only locals
      if (inputPath.host) return;
        
      // resolve path
      if (/^\//.test(assetUrl.pathname)) {
        // absolute
        assetPath = path.normalize(process.cwd()+ '/'+opts.imagesPath+'/' + assetUrl.pathname)
      } else {
        // relative
        assetPath = assetPath+'/'+assetUrl.pathname;
        assetPath = path.normalize(assetPath);
        assetPath = path.normalize(assetUrl.pathname);
      }

      // cachebuster
      var mtime = fs.statSync(assetPath).mtime;
      var cachebuster = mtime.getTime().toString(16);

      // complete url with cachebuster
      if (assetUrl.search) {
        assetUrl.search = assetUrl.search + '&v' + cachebuster;
      } else {
        assetUrl.search = '?v' + cachebuster;
      }

      // replace old value
      declaration.value = "url('"+url.format(assetUrl)+"')";      
    
    })

  };
});