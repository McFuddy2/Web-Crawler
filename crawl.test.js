const { test, expect } = require('@jest/globals')
const { normalizeURL } = require('./crawl.js')
const { getURLsFromHTML } = require('./crawl.js')


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


test ('getURLsFromHTML absolute URLS', () => {
    const inputHTMLBody = `
    <html>
        <body>
            <a href="https://blog.boot.dev/"><span>Go to Boot.dev</span></a>
        </body>
    </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = ["https://blog.boot.dev/"]
    expect(actual).toEqual(expected)
})


test ('getURLsFromHTML relative URLS', () => {
    const inputHTMLBody = `
    <html>
        <body>
            <a href="/path/"><span>Go to Boot.dev path</span></a>
        </body>
    </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = ["https://blog.boot.dev/path/"]
    expect(actual).toEqual(expected)
})


test ('getURLsFromHTML both relative and absolute URLS', () => {
    const inputHTMLBody = `
    <html>
        <body>
        <a href="https://blog.boot.dev/path/"><span>Go to Boot.dev path</span></a>
        <a href="/path2/"><span>or take path 2</span></a>
        </body>
    </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = ["https://blog.boot.dev/path/","https://blog.boot.dev/path2/"]
    expect(actual).toEqual(expected)
})


test ('getURLsFromHTML remove invalid links', () => {
    const inputHTMLBody = `
    <html>
        <body>
        <a href="wrong"><span>Go to Boot.dev path</span></a>
        </body>
    </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = []
    expect(actual).toEqual(expected)
})







