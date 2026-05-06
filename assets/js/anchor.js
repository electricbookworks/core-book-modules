import AnchorJS from 'anchor-js'
import { locales, pageLanguage } from './locales'

export default function ebAnchor () {
  const anchors = new AnchorJS()
  anchors.options = {
    placement: 'right', // 'left' disappears outside viewport
    visible: 'always', // users should see that this is available
    icon: locales[pageLanguage].links['anchor-link']
  }
  anchors.add(':not(.landing-page) > div[role="main"] > .content h3')
  anchors.add('.frontmatter h2, .endmatter h2')
}
