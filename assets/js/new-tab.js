const ebNewTabInit = function () {
  // check for browser support of the features we use
  return navigator.userAgent.indexOf('Opera Mini') === -1 &&
    'querySelector' in document &&
    !!Array.prototype.forEach
}

// *CSS selectors* to target
const ebNewTabTargets = 'a[href*="//"], .figure-image-link'

const ebNewTab = function () {
  // early exit for lack of browser support
  if (!ebNewTabInit()) return

  const links = document.querySelectorAll(ebNewTabTargets)

  links.forEach(function (link) {
    // Ignore links where target="_self" has been explicitly set
    if (link.getAttribute('target') !== '_self') {
      link.target = '_blank'
      link.rel = 'noopener'
    }
  })
}

export default ebNewTab
