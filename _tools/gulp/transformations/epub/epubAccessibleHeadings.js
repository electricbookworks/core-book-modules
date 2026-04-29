function epubAccessibleHeadings ($) {
  // Replace prerequisite box h3s with h2s
  $('.box.prerequisites h3').each(function () {
    const contents = $(this).html()
    $(this).replaceWith(`<h2>${contents}</h2>`)
  })
}

exports.epubAccessibleHeadings = epubAccessibleHeadings
