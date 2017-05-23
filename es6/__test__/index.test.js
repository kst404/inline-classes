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
      `

      const actual = parseStyles(testData, '._root-selector')

      expect(actual).toMatchSnapshot()
    })
  })
})
