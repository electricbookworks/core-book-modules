export default function ebFootnotesHiddenPdf () {
  const footnotes = document.querySelectorAll('.footnote-detail, .footnotes')
  footnotes.forEach(function (footnote) {
    footnote.style.display = 'none'
  })
}
