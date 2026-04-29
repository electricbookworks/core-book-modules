function epubDocNoteref ($) {
  // Remove deprecated role from footnote sups
  $('sup[role^="doc-noteref"]').each(function () {
    $(this).removeAttr('role')
  })
}

exports.epubDocNoteref = epubDocNoteref
