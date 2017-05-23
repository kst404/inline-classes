'use strict';

var _xxhashjs = require('xxhashjs');

var _xxhashjs2 = _interopRequireDefault(_xxhashjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var classes = [];
var styleSheet = void 0,
    rulesInserted = 0;

function parseStyles(styles, rootSelector) {
  var curpos = 0,
      currentSelector = [rootSelector],
      currentProps = '',
      result = {};
  var chunks = styles.split(/[;}{]/);

  var flushSelector = function flushSelector() {
    var generatedSelector = currentSelector[currentSelector.length - 1];

    if (result.hasOwnProperty(generatedSelector)) {
      result[generatedSelector] += currentProps.replace(/\s+/g, ' ').trim();
    } else {
      result[generatedSelector] = currentProps.replace(/\s+/g, ' ').trim();
    }
  };

  chunks.forEach(function (chunk) {
    var suffix = curpos + chunk.length < styles.length ? styles.charAt(curpos + chunk.length) : '';

    switch (suffix) {
      case '{':
        if (currentProps !== '') {
          flushSelector();
        }

        currentSelector.push(chunk.replace(/\s+/g, ' ').trim().replace(/[&]/g, currentSelector[currentSelector.length - 1]));
        currentProps = '';
        break;
      case '}':
        flushSelector();

        currentSelector.pop();
        currentProps = '';
        break;
      case ';':
        currentProps += chunk + ';';
        break;
      default:
    }

    // if(suffix === '{') {
    // }
    // else if(suffix === '}') {
    // }
    // else if(suffix === ';') {
    // }
    // else {
    //   // TODO
    // }

    curpos += chunk.length + 1;
  });

  if (currentProps !== '') {
    flushSelector();
  }

  return result;
}

function createStyleTag() {
  var styleTag = document.createElement('style');
  styleTag.appendChild(document.createTextNode(''));

  document.head.appendChild(styleTag);

  styleSheet = styleTag.sheet;
}

function appendRule(styleHash, styles) {
  if (!styleSheet) {
    createStyleTag();
  }

  if (classes.indexOf(styleHash) === -1) {
    var parsedStyles = parseStyles(styles, '.' + styleHash);

    for (var selector in parsedStyles) {
      if (parsedStyles.hasOwnProperty(selector)) {
        styleSheet.insertRule(selector + ' {' + parsedStyles[selector] + '}', rulesInserted);
        rulesInserted++;
      }
    }
    classes.push(styleHash);
  }
}

module.exports.css = function css(styles) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  var interpolatedStyles = String.raw.apply(String, [styles].concat(_toConsumableArray(values.map(function (val) {
    return val === false || val === undefined ? '' : val;
  }))));
  var styleHash = '_' + _xxhashjs2.default.h32(interpolatedStyles.replace(/\s+/g, ' '), 0x0000).toString(16);

  var modifiedStyles = interpolatedStyles;

  appendRule(styleHash, modifiedStyles);

  return styleHash;
};