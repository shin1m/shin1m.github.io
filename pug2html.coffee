fs = require 'fs'
join = (require 'path').join
pug = require 'pug'

pattern = /\.pug$/
modified = null

render = (path, root) ->
  fs.lstat path, (err, stat) ->
    throw err if err
    if stat.isFile() && pattern.test(path)
      target = path.replace pattern, '.html'
      fs.lstat target, (err, stat0) ->
        return unless err || stat0.mtime < stat.mtime || stat0.mtime < modified
        fs.readFile path, 'utf8', (err, source) ->
          throw err if err
          output = pug.compile(source, {filename: path}) {root: root}
          fs.writeFile target, output, (err) ->
            throw err if err
            console.log 'rendered %s', target
    else if stat.isDirectory()
      fs.readdir path, (err, files) ->
        throw err if err
        files.map((file) -> join path, file).forEach (path) ->
          render path, root + '../'

fs.lstat 'layout.pug', (err, stat) ->
  throw err if err
  modified = stat.mtime
  render 'index.pug', ''
  render 'creole.js', ''
