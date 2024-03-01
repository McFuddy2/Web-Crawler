const { test, expect } = require('@jest/globals')
const { sortPages } = require('./report.js')



test ('Sort 2 Pages', () => {
    const input = {
        'www.wagslane.dev/posts/leave-scrum-to-rugby': 5,
        'www.wagslane.dev/posts/kanban-vs-scrum': 4
    }
    const actual = sortPages(input)
    const expected = [
            ['www.wagslane.dev/posts/leave-scrum-to-rugby', 5 ],
            ['www.wagslane.dev/posts/kanban-vs-scrum', 4]
    ]
    expect(actual).toEqual(expected)
})

test ('Sort Pages', () => {
    const input = {
        'www.wagslane.dev/posts/bommy': 5,
        'www.wagslane.dev/posts/spell-check': 2,
        'www.wagslane.dev/posts/what-is-scrum': 1,
        'www.wagslane.dev/posts/leave-scrum-to-rugby': 999,
        'www.wagslane.dev/posts/kanban-vs-scrum': 4
    }
    const actual = sortPages(input)
    const expected = [
            ['www.wagslane.dev/posts/leave-scrum-to-rugby', 999 ],
            ['www.wagslane.dev/posts/bommy', 5 ],
            ['www.wagslane.dev/posts/kanban-vs-scrum', 4 ],
            ['www.wagslane.dev/posts/spell-check', 2 ],
            ['www.wagslane.dev/posts/what-is-scrum', 1]
    ]
    expect(actual).toEqual(expected)
})