import { ebInIframe } from './utilities'

function ebLoadPardotTracking () {
  // const piAId = '1016132'
  // const piCId = '1682'
  // const piHostname = 'pi.pardot.com';

  (function () {
    function asyncLoad () {
      const s = document.createElement('script'); s.type = 'text/javascript'
      s.src = (document.location.protocol === 'https:' ? 'https://pi' : 'http://cdn') + '.pardot.com/pd.js'
      const c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c)
    }

    if (window.attachEvent) {
      window.attachEvent('onload', asyncLoad)
    } else {
      window.addEventListener('load', asyncLoad, false)
    }
  })()
}

function ebCookies () {
  const cookieBanner = document.querySelector('.cookie-banner')
  if (!cookieBanner) {
    return
  }
  const cookieBannerBackground = document.querySelector('.cookie-banner-background')
  const acceptButton = cookieBanner.querySelector('button.js-accept')
  const rejectButton = cookieBanner.querySelector('button.js-reject')

  // If we have entered this method, the user has not set preferences and so
  // they need to be shown the banner
  cookieBanner.classList.remove('visuallyhidden')
  cookieBannerBackground.classList.remove('visuallyhidden')

  // Hide the banner if the user hits Escape or the close button
  cookieBanner.addEventListener('keydown', function (event) {
    // This will trickle down to the close button as well
    if (event.key === 'Escape') {
      cookieBanner.classList.add('visuallyhidden')
      cookieBannerBackground.classList.add('visuallyhidden')
    }
  })

  // Set expiration date for consent cookie
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  const cookieDetails = 'expires=' + oneYearFromNow + '; hostOnly=true; path=/'

  // If the user rejects cookies, set the core_tracking cookie to "essential"
  // and hide the banner
  rejectButton.addEventListener(('click'), function (event) {
    document.cookie = 'core_tracking=essential;' + cookieDetails
    cookieBanner.classList.add('visuallyhidden')
    cookieBannerBackground.classList.add('visuallyhidden')
  })
  rejectButton.addEventListener(('keydown'), function (event) {
    if (event.key === 'Enter') {
      document.cookie = 'core_tracking=essential;' + cookieDetails
      cookieBanner.classList.add('visuallyhidden')
      cookieBannerBackground.classList.add('visuallyhidden')
    }
  })

  // If the user accepts cookies, set the core_tracking cookie to "true",
  // load the analytics scripts, and hide the banner
  acceptButton.addEventListener(('click'), function (event) {
    document.cookie = 'core_tracking=all;' + cookieDetails
    ebLoadPardotTracking()
    cookieBanner.classList.add('visuallyhidden')
    cookieBannerBackground.classList.add('visuallyhidden')
  })
  acceptButton.addEventListener(('keydown'), function (event) {
    if (event.key === 'Enter') {
      document.cookie = 'core_tracking=all;' + cookieDetails
      ebLoadPardotTracking()
      cookieBanner.classList.add('visuallyhidden')
      cookieBannerBackground.classList.add('visuallyhidden')
    }
  })
}

function ebCheckForConsentCookie () {
  let hasCookie = false

  // Check whether the user has already made a decision about cookies
  if (document.cookie.includes('core_tracking')) {
    hasCookie = true
    // If they have previously accepted cookies, load the analytics script
    if (document.cookie.includes('core_tracking=all')) {
      ebLoadPardotTracking()
    }
  }
  if (!hasCookie) {
    ebCookies()
  }
}

export default function ebCookieBanner () {
  if (!ebInIframe()) {
    ebCheckForConsentCookie()
  }
}
