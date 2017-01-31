const XXH = require('xxhashjs')

const classes = []
let styleSheet, rulesInserted = 0

function parseStyles(styles, rootSelector) {
  let curpos = 0, currentSelector = [rootSelector], currentProps = '', result = {}
  const chunks = styles.split(/[;}{]/)

  const flushSelector = () => {
    const generatedSelector = currentSelector[currentSelector.length-1]

    if(result.hasOwnProperty(generatedSelector)) {
      result[generatedSelector] += currentProps.replace(/\s+/g, ' ').trim()
    }
    else {
      result[generatedSelector] = currentProps.replace(/\s+/g, ' ').trim()
    }
  }

  chunks.forEach(chunk => {
    const suffix = curpos + chunk.length < styles.length ? styles.charAt(curpos + chunk.length) : ''

    if(suffix === '{') {
      if(currentProps !== '') {
        flushSelector()
      }

      currentSelector.push(chunk.replace(/\s+/g, ' ').trim().replace(/[&]/g, currentSelector[currentSelector.length-1]))
      currentProps = ''
    }
    else if(suffix === '}') {
      flushSelector()

      currentSelector.pop()
      currentProps = ''
    }
    else if(suffix === ';') {
      currentProps += chunk + ';'
    }
    else {
      // TODO
    }

    curpos += chunk.length + 1
  })

  if(currentProps !== '') {
    flushSelector()
  }

  return result
}

function createStyleTag() {
  const styleTag = document.createElement('style')
  styleTag.appendChild(document.createTextNode(''))

  document.head.appendChild(styleTag)

  styleSheet = styleTag.sheet
}

function appendRule(styleHash, styles) {
  if(!styleSheet) {
    createStyleTag()
  }

  if(classes.indexOf(styleHash) === -1) {
    const parsedStyles = parseStyles(styles, '.' + styleHash)

    for (var selector in parsedStyles) {
      if (parsedStyles.hasOwnProperty(selector)) {
        styleSheet.insertRule(`${selector} {${parsedStyles[selector]}}`, rulesInserted)
        rulesInserted++
      }
    }
    classes.push(styleHash)
  }
}

module.exports.css = function css(styles, ...values) {
  const interpolatedStyles = String.raw(styles, ...values.map(val => val === false || val === undefined ? '' : val))
  const styleHash = '_' + XXH.h32(interpolatedStyles.replace(/\s+/g, ' '), 0x0000 ).toString(16)

  const modifiedStyles = interpolatedStyles

  appendRule(styleHash, modifiedStyles)

  return styleHash

}
