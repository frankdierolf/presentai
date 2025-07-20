// Debug module stub to prevent import errors
const noop = () => () => {}

// CommonJS exports
module.exports = noop
module.exports.debug = noop
module.exports.default = noop

// ES6 exports
export default noop
export const debug = noop

// Additional exports that debug module might provide
export const enabled = () => false
export const humanize = () => ''
export const formatters = {}
export const names = []
export const skips = []