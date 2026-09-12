// Shims de ambiente p/ jsdom + localStorage no node.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }) as unknown as MediaQueryList
}
if (!window.scrollTo) window.scrollTo = (() => {}) as typeof window.scrollTo
