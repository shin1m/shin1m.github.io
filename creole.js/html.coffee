class Builder
  escapes = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'}
  constructor: ->
    @macros = {}
    @reset()
  reset: ->
    @context = []
    @result = []
  e: (value) -> @result.push value.replace(/[&"<>]/g, (c) -> escapes[c])
  u: (value) -> @result.push value
  bold:
    start: -> @u '<strong>'
    end: -> @u '</strong>'
  italics:
    start: -> @u '<em>'
    end: -> @u '</em>'
  heading1:
    start: -> @u '<h1>'
    end: -> @u '</h1>'
  heading2:
    start: -> @u '<h2>'
    end: -> @u '</h2>'
  heading3:
    start: -> @u '<h3>'
    end: -> @u '</h3>'
  heading4:
    start: -> @u '<h4>'
    end: -> @u '</h4>'
  heading5:
    start: -> @u '<h5>'
    end: -> @u '</h5>'
  heading6:
    start: -> @u '<h6>'
    end: -> @u '</h6>'
  link:
    start: (options) ->
      @u '<a href="'
      @e options.link
      @u '">'
    end: -> @u '</a>'
  url:
    start: (options) ->
      @u '<a href="'
      @e options.link
      @u '">'
      @e options.link
    end: -> @u '</a>'
  paragraph:
    start: -> @u '<p>'
    end: -> @u '</p>'
  lineBreak:
    start: -> @u '<br />'
    end: ->
  unorderedList:
    start: -> @u '<ul>'
    end: -> @u '</ul>'
  orderedList:
    start: -> @u '<ol>'
    end: -> @u '</ol>'
  listItem:
    start: -> @u '<li>'
    end: -> @u '</li>'
  horizontalRule:
    start: -> @u '<hr />'
    end: ->
  image:
    start: (options) ->
      @u '<img src="'
      @e options.link
      if options.title?
        @u '" title="'
        @e options.title
      @u '" />'
    end: ->
  table:
    start: -> @u '<table>'
    end: -> @u '</table>'
  tableRow:
    start: -> @u '<tr>'
    end: -> @u '</tr>'
  tableHeading:
    start: -> @u '<th>'
    end: -> @u '</th>'
  tableCell:
    start: -> @u '<td>'
    end: -> @u '</td>'
  nowiki:
    start: -> @u '<pre>'
    end: -> @u '</pre>'
  inlineNowiki:
    start: -> @u '<tt>'
    end: -> @u '</tt>'
  macro:
    start: (options) ->
      macro = @macros[options.name]
      if macro?
        macro @, options.parameters
      else
        @e 'Unknown macro: ' + options.name
    end: ->
  start: (name, options) ->
    handler = @[name]
    if handler?
      @context.push handler
      handler.start.call @, options
    else
      @context.push null
  end: ->
    @context.pop()?.end.call @
  text: (value) -> @e value

exports = module?.exports ? {}
window.html = exports if window?
exports.Builder = Builder
