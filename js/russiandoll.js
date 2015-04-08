;'use strict';

(function (_) {

  var _errorMessages = {
    templateMustBeString: 'Template must be a string',
    unknownIndent: "Indentation could not be determined. Do you have a paragraph and something nested in it?"
  };

  var _throwError = function (messageType, line) {
    var error = { message: _errorMessages[messageType] };
    if (line) error.line = line;
    throw new Error(JSON.stringify(error));
  };

  var Splitter = function (template) {

    // Deduce intentation
    var indentMatch = template.match(/^>(?![\r\n]){0,}[\r\n](\s+)/);
    if (!indentMatch) return _throwError('unknownIndent', 0);
    var indentation = indentMatch[1].length;

    // Split template by lines
    var lines = template.split(/\r|\n/g);
    lines = _(lines).map(function(line, i){

      // Deduce level and content from indentation
      var content = {
        level: line.match(/^(\s)*/)[0].length / indentation,
        content: line.match(/^\s*(.*)$/)[1],
        line: i
      };

      // Return content if line is not empty
      return !/^\s*$/.test(line) ? content : null;

    });

    // Discard empty lines
    lines = _.compact(lines);

    // Recursive function that looks for the deepest node
    // and nest it in its logical parent
    (function foldLevels (){

      // Find the deepest level.
      // If everything's flat, we're done: break
      var deepestLevel = _.max(lines, function(line){ return line.level; }).level;
      if (deepestLevel == 0) return;
      var deepestIndex = _(lines).indexOf(_(lines).findWhere({ level: deepestLevel }));

      // Remove it from the root and nest it in parent
      var foldable = lines.splice(deepestIndex, 1)[0];
      lines[deepestIndex-1].children = lines[deepestIndex-1].children || [];
      lines[deepestIndex-1].children.push(foldable);

      // Lookup for the next deepest level
      foldLevels.call(this);

    }).call(this);

    return lines;

  };

  var Tokenizer = function (splitLines) {

    // Utility to hardcode markdown-like tags for bold (**),
    // italic (*) and strikethrough (~~)
    var _replaceStyleTags = function (str) {
      return str
        .replace(/~~([^~]+?)~~/g,       '<del>$1</del>')
        .replace(/\*\*([^\*]+?)\*\*/g,  '<strong>$1</strong>')
        .replace(/\*([^\*]+?)\*/g,      '<em>$1</em>');
    };

    // Recursively replace line contents by tokens
    var tokens = (function tokenize (lines) {
      return _(lines).map(function(line, i){

        var content     = { }
          , isBlock  = /^>/.test(line.content);

        // Find block types and create tokens for them
        if ( isBlock ) {

          var blockID  = line.content.match(/^>>?([\w-_]+)?$/); // WARNING: WILL REJECT SILENTLY INVALID IDS.

          blockID = blockID[1] ? blockID[1] : false;

          if ( line.level === 0) {
            if (blockID) {
              content.type = 'paragraphWithID';
              content.value = blockID;
            } else {
              content.type = 'paragraph';
            }
          }

          if ( line.level !== 0) {
            if (blockID) {
              content.type = 'branchWithID';
              content.value = blockID;
            } else {
              content.type = 'branch';
            }
          }

          // Is the branch an double-bracketed (inline) branch
          if ( /^>>/.test(line.content) ) {
            content.inline = true;
          }

        // If line is a content line, tokenize inline elements
        } else {

          content.type = 'content';

          // Split group betwen links and non-links, then
          // tokenize accordingly
          var tokens = _.compact(line.content.split(/(\[[^\]]+\](?:\([^\)]+\))?)/g));
          tokens = _(tokens).map(function(token) {

            var linkMatch = token.match(/\[([^\]]+)\](?:\(([^\)]+)\))?/);

            // If token is not a link, it's plain text.
            if (!linkMatch)
              return { type: 'text', value: token };

            // Build link
            var link = { type: 'link', value: linkMatch[1] }

            // If there's a second part to the link tag, determine
            // if it is referring to a hidden paragraph or an external link.
            if (linkMatch[2]) {

              var paragraphWithIDTarget = (linkMatch[2].match(/^>([\w-_]+)?/) || [])[1]
                , externalLinkTarget    = (linkMatch[2].match(/^(http(s)?:\/\/.*)/) || [])[1];

              link.target = paragraphWithIDTarget || externalLinkTarget;

              link.external = !!externalLinkTarget;

            }

            return link;

          });

          content.value = _.flatten(tokens);

        }

        line.content = content;

        if (line.children && line.children.length)
          line.children = tokenize.call(this, line.children);

        return line;

      });

    }).call(this, splitLines);

    // Link immediate content tokens by creating
    // an intermediate branch between them (new branch shortcut)
    tokens = (function linkBranches (tokens) {
      return _(tokens).map(function(token, x){

        if ( token.children ) {
          token.children = _(token.children).map(function(child){
            if ( token.content.type == 'content' &&
              child.content.type == 'content' ) {
              return {
                content: { type: 'branch' },
                children: [child]
              }
            }
            return child;
          });

          linkBranches.call(this, token.children);
        }

        return token;

      });
    }).call(this, tokens);

    return tokens;

  };

  var Parser = function (tree) {

    // Utility to hardcode html tags for bold,
    // italic and strikethrough
    var _replaceStyleTags = function (str) {
      return str
        .replace(/~~([^~]+?)~~/g,       '<del>$1</del>')
        .replace(/\*\*([^\*]+?)\*\*/g,  '<strong>$1</strong>')
        .replace(/\*([^\*]+?)\*/g,      '<em>$1</em>');
    };

    var output = (function parseTokens (tokens, refIds) {

      var results = [], refIds = refIds || [];

      _(tokens).each(function(token, i){

        if ( token.content.type == 'paragraph' ) {
          var content = _.flatten(parseTokens(token.children)).join('');
          results.push([
            '<p>',
            _replaceStyleTags(content),
            '</p>'
          ]);
        }

        if ( token.content.type == 'paragraphWithID' ) {
          var content = _.flatten(parseTokens(token.children)).join('');
          results.push([
            '<p data-rd-openedby-id="' + token.content.value + '">',
             _replaceStyleTags(content),
            '</p>'
          ]);
        }

        if ( token.content.type == 'branch' ) {

          var content = _.flatten(parseTokens(token.children)).join('');
          var id = refIds.length == 1 ? refIds[0] : refIds[i];

          // If branch isn't inline, push a space before it
          results.push([
            '<span data-rd-openedby-i="' + id + '">',
            token.content.inline ? '' : '&nbsp',
             _replaceStyleTags(content),
            '</span>'
          ]);

        }

        if ( token.content.type == 'branchWithID' ) {

          var content = _.flatten(parseTokens(token.children)).join('');

          // If branch isn't inline, push a space before it
          results.push([
            '<span data-rd-openedby-id="' + token.content.value + '">',
            token.content.inline ? '' : '&nbsp',
             _replaceStyleTags(content),
            '</span>'
          ]);

        }

        if ( token.content.type == 'content' ) {

          // Render text and links differently
          _(token.content.value).each(function(contentElement){
            if (contentElement.type == 'text') {

              results.push(_.escape(contentElement.value));

            } else {

              // Create unique id for link
              var id = _.uniqueId(); refIds.push(id);

              // Create id-based or index-based links depending
              // on target existence
              if (contentElement.target) {
                if (contentElement.external) {
                  results.push([
                    '<a href="' + contentElement.target + '" target="_blank">'
                  ]);
                } else {
                  results.push([
                  '<a data-rd-opens-id="' + contentElement.target + '">'
                  ]);
                }
              } else {
                results.push([
                  '<a data-rd-opens-i="' + id + '">'
                ]);
              }

              results.push([
                _.escape(contentElement.value),
                '</a>'
              ])

            }
          });

          // If token contains branches, push those branches
          if (token.children)
            results.push(parseTokens.call(this, token.children, refIds));

        }

      });

      return results;

    }).call(this, tree);

    return _.flatten(output).join('');

  };

  var RussianDoll = function (template) {

    if (!_.isString(template))
      throw new Error(_errorMessages.templateMustBeString);

    // If RussianDoll has been called directly, mutate
    // into a single-use instance that automatically returns
    // the parsed html
    if ( !(this instanceof RussianDoll) )
      return (new RussianDoll(template)).html;

    // If the template has been wrapped in comments,
    // strip them. This is mainly a visual feature:
    // it allows embedding RussianDoll templates directly
    // in HTML without messing with syntax highlighting.
    var templateContent = template
      .replace(/^(\/\*\s*)/i, '')
      .replace(/(\s*\*\/\s*)$/i, '');

    var splitLines  = Splitter(templateContent);
    this.tree       = Tokenizer(splitLines);
    this.html       = Parser(this.tree);

  };

  this.RussianDoll = RussianDoll;

}).call(function() {
  // Sequentially try to bind to current context,
  // window, then Node global scope
  return this || (typeof window !== 'undefined' ? window : global);
}(), _);