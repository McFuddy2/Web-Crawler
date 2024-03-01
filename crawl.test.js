const { test, expect } = require('@jest/globals')
const { normalizeURL } = require('./crawl.js')


test ('normalizeURL just site and path', () => {
    const input = "https://pokemon.com/home"
    const actual = normalizeURL(input)
    const expected = "pokemon.com/home"
    expect(actual).toEqual(expected)
})

test ('normalizeURL trailing /', () => {
    const input = "https://pokemon.com/home/"
    const actual = normalizeURL(input)
    const expected = "pokemon.com/home"
    expect(actual).toEqual(expected)

})

test ('normalizeURL capitals', () => {
    const input = "https://Pokemon.Com/home"
    const actual = normalizeURL(input)
    const expected = "pokemon.com/home"
    expect(actual).toEqual(expected)

})

test ('normalizeURL http vs https', () => {
    const input = "http://pokemon.com/home"
    const actual = normalizeURL(input)
    const expected = "pokemon.com/home"
    expect(actual).toEqual(expected)

})