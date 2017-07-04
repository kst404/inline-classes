function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
  hash functions:
  https://github.com/darkskyapp/string-hash | 18 lines (13 sloc)  408 Bytes
  https://github.com/srijs/rusha | 532 lines (532 sloc)  22 KB | 2 lines (2 sloc)  7.31 KB min
  https://github.com/vigour-io/quick-hash ← murmurhash | 62 lines (52 sloc)  1.96 KB
 */

// import XXH from 'xxhashjs'
import stringHash from 'string-hash';

var classes = [];
var styleSheet = void 0,
    rulesInserted = 0;

export function parseStyles(styles, rootSelector) {
  var curpos = 0,
      currentSelector = [rootSelector],
      currentProps = '',
      result = {},
      mediaBraces = 0,
      mediaQuery = false;
  var chunks = styles.split(/[;}{]/);

  var flushSelector = function flushSelector() {
    var generatedSelector = currentSelector[currentSelector.length - 1];

    currentProps = currentProps.replace(/\s+/g, ' ').trim();

    if (mediaQuery !== false) {
      result[mediaQuery][generatedSelector] = (result[mediaQuery][generatedSelector] || '') + currentProps;
    } else {
      result[generatedSelector] = (result[generatedSelector] || '') + currentProps;
    }
  };

  chunks.forEach(function (chunk) {
    var suffix = curpos + chunk.length < styles.length ? styles.charAt(curpos + chunk.length) : '';

    switch (suffix) {
      case '{':
        if (currentProps !== '') {
          flushSelector();
        }

        currentProps = '';

        if (chunk.indexOf('@media') !== -1) {
          mediaQuery = chunk.replace(/[\r\n\s]+/g, ' ').trim();
          mediaBraces = 0;
          currentSelector = currentSelector.slice(0, 1);
          result[mediaQuery] = {};
        } else {
          var chunkSelector = chunk.replace(/[\r\n\s]+/g, ' ').trim().split(',').map(function (sel) {
            return sel.trim();
          }).map(function (sel) {
            return sel.charAt(0) === '&' ? sel : '& ' + sel;
          }).join(',');

          currentSelector.push(chunkSelector.replace(/[&]/g, currentSelector[currentSelector.length - 1]));

          if (mediaQuery !== false) {
            mediaBraces++;
          }
        }
        break;
      case '}':
        flushSelector();

        currentSelector.pop();
        currentProps = '';

        if (mediaQuery !== false) {
          mediaBraces--;

          if (mediaBraces === -1) {
            mediaQuery = false;
          }
        }
        break;
      case ';':
        currentProps += chunk + ';';
        break;
      default:
    }

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
        if (selector.substr(0, 6) === '@media') {
          var nestedSelectorsString = '';
          for (var nestedSelector in parsedStyles[selector]) {
            if (parsedStyles[selector].hasOwnProperty(nestedSelector)) {
              nestedSelectorsString += nestedSelector + ' {' + parsedStyles[selector][nestedSelector] + '}';
            }
          }
          styleSheet.insertRule(selector + ' {' + nestedSelectorsString + '}', rulesInserted);
          // console.log(`${selector} {${nestedSelectorsString}}`)
        } else {
          styleSheet.insertRule(selector + ' {' + parsedStyles[selector] + '}', rulesInserted);
        }
        rulesInserted++;
      }
    }
    classes.push(styleHash);
  }
}

export function css(styles) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  var interpolatedStyles = String.raw.apply(String, [styles].concat(_toConsumableArray(values.map(function (val) {
    return val === false || val === undefined ? '' : val;
  }))));
  // const styleHash = '_' + XXH.h32(interpolatedStyles.replace(/\s+/g, ' '), 0x0000 ).toString(16)
  var styleHash = '_' + stringHash(interpolatedStyles.replace(/\s+/g, ' '));

  appendRule(styleHash, interpolatedStyles);

  return styleHash;
}