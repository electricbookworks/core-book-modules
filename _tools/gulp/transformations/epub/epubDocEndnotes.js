function epubDocEndnotes ($) {
  // Remove deprecated role from footnote lis
  $('li[role^="doc-endnote"]').each(function () {
    $(this).removeAttr('role')
  })
}

exports.epubDocEndnotes = epubDocEndnotes
