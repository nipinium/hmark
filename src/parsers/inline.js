const { tokenize } = require('./utils')

module.exports = (input, opts = {}) => {
    if (typeof input === 'string') input = tokenize(input)
    return parse(input, opts)
}

const parsers = {
    '`': { name: 'code', call: require('./inline/code') },
    '<': { name: 'link', call: require('./inline/link') },
    '!': { name: 'image', call: require('./inline/image') },
    ':': { name: 'emoji', call: require('./inline/emoji') },
    '[': { name: 'custom', call: require('./inline/custom') },
    '*': { name: 'emphasis', call: require('./inline/emphasis') },
    '_': { name: 'emphasis', call: require('./inline/emphasis') },
}

function parse(input, opts = {}) {
    let output = []
    let match = null

    for (let i = 0; i < input.length; i++) {
        let parser = parsers[input[i][0]]

        if (parser && opts[parser.name] !== false) {
            if ((match = parser.call(input, i))) {
                if (parser.name === 'emphasis') {
                    match.output.body = parse(match.output.body, opts)
                }
                output.push(match.output)
                i = match.offset
                continue
            }
        }

        let last = output[output.length - 1] || {}
        let curr = input[i]
        if (last.tag === 'text') last.body.push(curr)
        else output.push({ tag: 'text', body: [curr] })
    }

    return output
}
