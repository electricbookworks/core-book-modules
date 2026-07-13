import '../polyfills'
import ebAccessibleHeadings from '../accessible-headings'
import ebAccordion from '../accordion'
import { ebAddCopyButtons } from '../copy-to-clipboard'
import ebAnalytics from '../analytics'
import ebAnchor from '../anchor'
import ebAnnotation from '../annotation'
import ebBaselineGrid from '../baseline-grid'
import ebBookmarks from '../bookmarks-legacy'
import ebBump from '../bump'
import ebCitations from '../citations'
import ebComponents from '../components'
import ebCookieBanner from '../cookie-banner'
// import ebCorePdf from '../footnotes-core-pdf'
import ebDarkMode from '../dark-mode'
import ebDefinitions from '../definitions'
// import ebEndnotesCore from '../endnotes-core-pdf'
import ebEpubMCQs from '../epub-mcqs'
import ebExpandableBox from '../expandable-box'
import ebFooterNotice from '../footer-notice'
import ebFootnotePopups from '../footnote-popups'
import ebFootnotesHiddenPdf from '../footnotes-hidden-pdf'
import ebFullscreenImages from '../fullscreen-images'
import ebHeadingTitles from '../heading-titles'
import ebHolmesFilter from '../holmes-filter'
import ebIndexTargetsInit from '../index-targets'
import ebLandingPage from '../landing-page'
import ebLanguageSelect from '../language-select'
import ebLazyLoad from '../lazyload'
import ebLoginPrompts from '../login-prompts'
import ebMarkParents from '../mark-parents'
import ebMarkSiblings from '../mark-siblings'
import ebMCQs from '../mcqs'
import ebMigrateStorage from '../migrate-storage'
import ebMoveBelowFootnotes from '../move-below-footnotes'
import ebNav from '../nav'
import ebNewTab from '../new-tab'
import ebNotifications from '../notifications'
import ebOwidIframes from '../owid-iframes'
import ebPageReference from '../page-reference'
import ebPdfSlides from '../pdf-slides'
import ebPrinceBoxInfo from '../prince-box-info'
import ebProgressBar from '../progress-bar'
import ebRedact from '../redact'
import ebRotate from '../rotate'
import ebSelectList from '../select-list'
import ebSessionConditional from '../session-conditional'
import ebSetup from '../setup'
import ebShare from '../share'
import ebShiftElements from '../shift-elements'
import ebShowHide from '../show-hide'
import ebSidenotes from '../sidenotes'
import ebSlides from '../slides'
import ebStudents from '../students'
import ebSvgManagement from '../svg-management'
import ebTables from '../tables'
import ebTranscripts from '../transcripts'
import ebVideos from '../videos'
import ebWordPressUserProfile from '../wordpress-user-profile'

// console.log('Config:', process.env.config)
// console.log('Settings:', process.env.settings)
// console.log('Works:', process.env.works)
// console.log('Output:', process.env.output)
// console.log('Build:', process.env.build)

const outputSettings = process.env.settings[process.env.output] || {}

// Create index targets first because this script reconstructs the DOM,
// potentially breaking event listeners, state, and node lists for other scripts.
if (process.env.settings['dynamic-indexing'] !== false) {
  /*
    Script to turn HTML comments into anchor targets.
    Also handled by gulp in PDF, epub; but included
    in all outputs so that Puppeteer can index.
  */
  ebIndexTargetsInit()
}

ebMarkParents()

if (process.env.settings.redact === true) {
  ebRedact()
}

if (process.env.output === 'web' || process.env.output === 'app') {
  ebSetup()
}

// Prioritise these for web
if (process.env.output === 'web') {
  ebSessionConditional()
  if (outputSettings['login-prompts'] === true) {
    ebLoginPrompts()
  }
  if (outputSettings['wordpress-user-profile'] === true) {
    ebWordPressUserProfile()
  }
  ebAnchor()
}

if (process.env.output === 'web' || process.env.output === 'app') {
  ebNav()
  ebVideos()
  ebMCQs()
  ebSelectList()
  ebTables()
  ebFootnotePopups()
  ebSlides()
  ebShowHide()
  ebAddCopyButtons()
  ebShare()
  ebExpandableBox()
  ebNewTab()
  ebDefinitions()
  ebSidenotes()
  ebOwidIframes()
  ebDarkMode()
  ebNotifications()
  ebLanguageSelect()
  ebTranscripts()
  ebComponents()
  ebHolmesFilter()
  ebProgressBar()
  ebAccessibleHeadings()
  ebLandingPage()
  ebMoveBelowFootnotes()

  /*
    This script replaces citation ids with citation labels, if the book
    uses a references.yml file. Loaded in bundle for non-PDF outputs.
  */
  ebCitations()

  if (outputSettings.images?.fullscreen === true) {
    ebFullscreenImages()
  }

  if (outputSettings.svg?.inject === true) {
    // This currently does nothing for lazy-loaded images, because there is no src attribute for SVGInject to work with.
    // So it is not clear why this is called before lazy loading - re "Load after svg management" below.
    // Additionally, the lazy loading script simply calls SVGInject again, but without any of the customisations in svg-management.
    // Keeping for now, in case there are non-lazy-loaded SVGs with inject-svg class.
    ebSvgManagement()
  }

  // Load after svg management
  ebLazyLoad()
}

const devAnnotation = process.env.build !== 'live' && outputSettings.annotator?.development === true
const liveAnnotation = process.env.build === 'live' && outputSettings.annotator?.live === true
if (devAnnotation || liveAnnotation) {
  ebAnnotation()
}

if (outputSettings.accordion?.enabled === true) {
  ebAccordion()
}

if (outputSettings.bookmarks?.enabled === true) {
  ebBookmarks()
  process.env.build === 'live' && ebMigrateStorage()
}

if (process.env.output === 'screen-pdf' || process.env.output === 'print-pdf') {
  // Load Prince-specific utilities.
  ebPrinceBoxInfo()

  /*
    This script gives every heading a title attribute.
    This is useful to Prince, which can use title attributes for running heads.
    By default, we only load it for PDF outputs.
  */
  ebHeadingTitles()

  // Mark previous sibling elements for CSS purposes.
  ebMarkSiblings()

  // Restructure slides where necessary.
  ebPdfSlides()

  // This script helps rotate large figures on the page.
  ebRotate()

  /*
    Uncomment one of the following three scripts.
    1. ebCorePdf()

    2. ebEndnotesCore moves footnotes to endnotes
    at the back of the book. Make sure there is a markdown file
    with `style: endnotes` in the output. This is custom
    code for CORE, not default EBT. This won't work if
    `--merged` is set to `false` on output.
    ebEndnotesCore()

    3. ebFootnotesHiddenPdf hides footnotes entirely. This is custom
    code for CORE, not default EBT.
  */
  ebFootnotesHiddenPdf()

  // This script shifts elements in the DOM.
  ebShiftElements()

  /*
    This script detects the page number we are on and provides
    the relevant page cross-reference text as generated content.
  */
  ebPageReference()

  /*
    This script lets us bump an element up the DOM,
    for instance if we want an element to appear in the sidebar
    beside the element that it follows in the DOM.
  */
  ebBump()

  // This aligns elements to a baseline grid.
  ebBaselineGrid()
}

// This script generates a "For instructors' use only" footer in screen-pdfs
if (process.env.output === 'screen-pdf') {
  ebFooterNotice()
}

if (process.env.config?.audience === 'students') {
  ebStudents()
}

// Scripts for epub output. Do not expect support in many readers.
if (process.env.output === 'epub') {
  ebShowHide()
  ebEpubMCQs()
}

if (process.env.output === 'web') {
  // low priority scripts for web output
  ebCookieBanner()
  // Add analytics tracking after all elements have loaded
  ebAnalytics()
}
