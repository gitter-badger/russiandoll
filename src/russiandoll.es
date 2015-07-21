"use strict";

const errorMessages = {
  sourceMustBeString:     "Source must be a string",
  unmatchedCurlyBrackets: "Unmatched curly brackets {}",
  paragraphInFragment:    "Cannot nest a paragraph inside a fragment"
};

const regExps = {
  elements: {
    curlyBrackets:  /(\{(?:[A-z\u00C0-\u00ff\d-_']+\:)?|\})/,
    paragraph:      /(\>[A-z\u00C0-\u00ff\d-_']*)\s?/g,
    fragmentLink:   /(\[[^\]]*\](?:#[A-z\u00C0-\u00ff\d-_']+)?)/g
  },
  matches: {
    paragraph:      /\>([A-z\u00C0-\u00ff\d-_']*)\s?/g,
    fragmentLink:   /\[([^\]]*)\](?:#([A-z\u00C0-\u00ff\d-_']+))?/g,
    fragmentOpen:   /\{(?:([A-z\u00C0-\u00ff\d-_']+)\:)?/g,
    fragmentClose:  /\}/g
  },
  tags: {
    strikethrough:  /~~([^~]+?)~~/g,
    bold:           /(?:\*\*|__)([^\*]+?)(?:\*\*|__)/g,
    italic:         /(?:\*|_)([^\*]+?)(?:\*|_)/g,
    image:          /!\(([^\)]*)\)/g,
    link:           /@([^\(]+)\((http(s)?:\/\/.*)\)/g
  }
};

const safeStr = (str) => {
  return (/^[0-9]+$/.test(str) || /^_/.test(str) ? '_' : '') +
    _.kebabCase(_.deburr(_.escape(str)));
}

const markup = (str) => _.escape(str)
  .replace(regExps.tags.strikethrough, '<del>$1</del>')
  .replace(regExps.tags.bold,          '<strong>$1</strong>')
  .replace(regExps.tags.italic,        '<em>$1</em>')
  .replace(regExps.tags.image,         '<img src="$1" />')
  .replace(regExps.tags.link,          '<a href="$2" target="_blank" class="external">$1</a>');

let tokenizer = (source) => {

  if (_.size(source.match(/\{/)) != _.size(source.match(/\}/)))
    throw new SyntaxError(errorMessages.unmatchedCurlyBrackets);

  source = [source];

  source = _.map(_.compact(_.flatten(source)), (source) =>
    source.split(regExps.elements.curlyBrackets));
  source = _.map(_.compact(_.flatten(source)), (source) =>
    source.split(regExps.elements.paragraph));
  source = _.map(_.compact(_.flatten(source)), (source) =>
    source.split(regExps.elements.fragmentLink));

  return _.compact(_.flatten(source));

}

let parser = (tokens) => {

  let lastIds = [[]], level = 0;
  let result = _.reduce(tokens, (output, token, i) => {

    let matches = {};
    _.each(_.clone(regExps.matches), (v, k) => {
      v.lastIndex = 0; matches[k] = v.exec(token);
    });

    if (matches.paragraph) {

      if (level > 0)
        throw new SyntaxError(errorMessages.paragraphInFragment);

      let openedBy = matches.paragraph[1]
        ? ` data-opened-by="${ safeStr(matches.paragraph[1]) }"` : '';
      output += `</p><p${ openedBy }>`;

    } else if (matches.fragmentOpen) {

      let id = matches.fragmentOpen[1]
        ? safeStr(matches.fragmentOpen[1]) : _.first(_.last(lastIds));

      lastIds[_.size(lastIds) - 1].shift();
      output += `<span data-opened-by="${ id || '_nothing' }">`;
      lastIds.push([]);
      level++;

    } else if (matches.fragmentClose) {

      output += `</span>`;
      lastIds.pop();
      level--;

    } else if (matches.fragmentLink) {

      let id;
      if (matches.fragmentLink[2]) {
        id = safeStr(matches.fragmentLink[2])
      } else {
        id = _.uniqueId(); lastIds[lastIds.length - 1].push(id);
      }

      output += `<a href="#" data-opens="${ id }">${ matches.fragmentLink[1] }</a>`;

    } else {

      output += markup(token);

    }

    return output;

  }, '');

  return `<p>${ result }</p>`;

}

function RussianDoll (source) {

  if (!_.isString(source))
    throw new TypeError(errorMessages.sourceMustBeString);

  this.source = source;
  this.tokens = tokenizer(this.source);
  this.html   = parser(this.tokens);

}
