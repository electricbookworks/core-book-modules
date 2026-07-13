function epubScrollableTables ($) {
  // Wrap every table in a .table-wrapper div so wide tables can scroll
  // horizontally instead of overflowing the page.
  // This mirrors the web build (assets/js/tables.js), which does not run in epub
  $('table').each(function () {
    // Don't double-wrap if a wrapper is already present.
    if ($(this).parent().hasClass('table-wrapper')) {
      return
    }
    $(this).wrap('<div class="table-wrapper"></div>')
  })
}

exports.epubScrollableTables = epubScrollableTables
