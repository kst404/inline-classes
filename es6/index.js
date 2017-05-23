import XXH from 'xxhashjs'

const classes = []
let styleSheet, rulesInserted = 0

export function parseStyles(styles, rootSelector) {
  let curpos = 0, currentSelector = [rootSelector], currentProps = '', result = {}, mediaBraces = 0, mediaQuery = false
  const chunks = styles.split(/[;}{]/)

  const flushSelector = () => {
    const generatedSelector = currentSelector[currentSelector.length-1]

    currentProps = currentProps.replace(/\s+/g, ' ').trim()

    if(mediaQuery !== false) {
        result[mediaQuery][generatedSelector] = (result[mediaQuery][generatedSelector] || '') + currentProps
    }
    else {
      result[generatedSelector] = (result[generatedSelector] || '') + currentProps
    }
  }

  chunks.forEach(chunk => {
    const suffix = curpos + chunk.length < styles.length ? styles.charAt(curpos + chunk.length) : ''

    switch (suffix) {
      case '{':
        if(currentProps !== '') {
          flushSelector()
        }

        currentProps = ''

        if(chunk.indexOf('@media') !== -1) {
          mediaQuery = chunk.replace(/[\r\n\s]+/g, ' ').trim()
          mediaBraces = 0
          currentSelector = currentSelector.slice(0,1)
          result[mediaQuery] = {}
        }
        else {
          const chunkSelector = chunk.replace(/[\r\n\s]+/g, ' ').trim()
          .split(',')
          .map(sel => sel.trim())
          .map(sel => sel.charAt(0) === '&' ? sel : `& ${sel}`)
          .join(',')

          currentSelector.push(chunkSelector.replace(/[&]/g, currentSelector[currentSelector.length-1]))

          if(mediaQuery !== false) {
            mediaBraces++
          }
        }
        break
      case '}':
        flushSelector()

        currentSelector.pop()
        currentProps = ''

        if(mediaQuery !== false) {
          mediaBraces--

          if(mediaBraces === -1) {
            mediaQuery = false
          }
        }
        break
      case ';':
        currentProps += chunk + ';'
        break
      default:
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
        if(selector.substr(0, 6) === '@media') {
          let nestedSelectorsString = ''
          for (var nestedSelector in parsedStyles[selector]) {
            if (parsedStyles[selector].hasOwnProperty(nestedSelector)) {
              nestedSelectorsString += `${nestedSelector} {${parsedStyles[selector][nestedSelector]}}`
            }
          }
          styleSheet.insertRule(`${selector} {${nestedSelectorsString}}`, rulesInserted)
          console.log(`${selector} {${nestedSelectorsString}}`)
        }
        else {
          styleSheet.insertRule(`${selector} {${parsedStyles[selector]}}`, rulesInserted)
        }
        rulesInserted++
      }
    }
    classes.push(styleHash)
  }
}

export function css(styles, ...values) {
  const interpolatedStyles = String.raw(styles, ...values.map(val => val === false || val === undefined ? '' : val))
  const styleHash = '_' + XXH.h32(interpolatedStyles.replace(/\s+/g, ' '), 0x0000 ).toString(16)

  const modifiedStyles = interpolatedStyles

  appendRule(styleHash, modifiedStyles)

  return styleHash

}
