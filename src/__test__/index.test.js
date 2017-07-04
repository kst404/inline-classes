import { css, parseStyles } from '../index'

describe('inline-classes', () => {
  describe('parseStyles function', () => {
    it('generate class for simple list of properties', () => {
      const testData = `
        background-color: #fff;
        margin: 0 auto;
      `

      const actual = parseStyles(testData, '._root-selector')

      expect(actual).toMatchSnapshot()
    })

    it('generate rules for selectors', () => {
      const testData = `
        p {
          background-color: #fff;
          margin: 0 auto;
        }
      `

      const actual = parseStyles(testData, '._root-selector')

      expect(actual).toMatchSnapshot()
    })

    it('generate rules for mix of simple list of properties and selectors', () => {
      const testData = `
        width: 50%;
        height: 30vh;

        p {
          background-color: #fff;
          margin: 0 auto;
        }

        border: 1px solid #999;
      `

      const actual = parseStyles(testData, '._root-selector')

      expect(actual).toMatchSnapshot()
    })

    it('generate rules for root properties, selectors and media queries', () => {
      const testData = `
        width: 50%;
        height: 30vh;

        p {
          background-color: #fff;
          margin: 0 auto;
        }

        border: 1px solid #999;

        @media (max-width: 1000px) {
          border: none;

          p {
            margin: 0;
          }
        }
      `

      const actual = parseStyles(testData, '._root-selector')

      expect(actual).toMatchSnapshot()
    })

    // it('temp tests', () => {
    //   const teststr = `p,
    //   div, span
    //   `
    //
    //   console.log(teststr.replace(/[\r\n\s]+/g, ' ').trim().split(','))
    //
    //   const testClassName = css`
    //     width: 50%;
    //     height: 30vh;
    //
    //     p {
    //       background-color: #fff;
    //       margin: 0 auto;
    //     }
    //
    //     border: 1px solid #999;
    //
    //     @media (max-width: 1000px) {
    //       border: none;
    //
    //       p {
    //         margin: 0;
    //       }
    //     }
    //   `
    //
    //   console.log(testClassName)
    // })
  })
})
