function epubBuildingBlockLinks ($) {
  // Format links to building blocks in epub
  $('.resources a[href*="?component="]').each(function () {
    $(this).attr('href', $(this).attr('href').split('?component=')[0])
  })
}

exports.epubBuildingBlockLinks = epubBuildingBlockLinks
