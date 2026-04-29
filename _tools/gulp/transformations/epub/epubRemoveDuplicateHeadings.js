// For methods you can use to manipulate $(this), see
// https://cheerio.js.org/docs/api/classes/Cheerio#manipulation-methods

function epubRemoveDuplicateHeadings ($) {
  // Remove h1s from sections, as these are duplicates
  $('.chapter.section h1').each(function () {
    $(this).remove()
  })
}

exports.epubRemoveDuplicateHeadings = epubRemoveDuplicateHeadings
