/* globals Prince */

import { locales, pageLanguage } from './locales.js'

// Teacher notice running footer
// Use with css:
// content: prince-script(footernotice);

export default function ebFooterNotice () {
  // Get the locale phrase for footer notice
  // for this HTML document's language;
  // pageLanguage is provided by locales.js
  const noticeText = locales[pageLanguage].pdf.notice

  if (typeof Prince === 'object' && typeof Prince.addScriptFunc === 'function') {
    // console.log('Adding footer notice in Prince.');
    Prince.addScriptFunc('footernotice', function () {
      // This attriute is only created when
      // notices are turned on in settings
      if (document.body.hasAttribute('data-pdf-notice')) {
        return noticeText
      } else {
        return ''
      }
    })
  }
}
