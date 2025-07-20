export default defineNuxtPlugin(() => {
  if (process.client) {
    // Polyfill for debug module to prevent import errors
    window.debug = window.debug || (() => () => {})
    
    // Also provide the debug function in global scope for modules that expect it
    if (typeof globalThis !== 'undefined') {
      globalThis.debug = globalThis.debug || (() => () => {})
    }
  }
})