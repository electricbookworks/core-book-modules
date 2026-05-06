'use strict'

const ebFigureAdvancerInit = function () {
  return navigator.userAgent.indexOf('Opera Mini') === -1 &&
        'querySelector' in document &&
        !!Array.prototype.forEach &&
        document.querySelectorAll('.slides')
}

function ebFigureAdvancerAddLinks (figure, nextFigureId) {
  const linkToNextFigure = document.createElement('a')
  linkToNextFigure.setAttribute('href', '#' + nextFigureId)
  linkToNextFigure.classList.add('slides-link-to-next-figure')
  // linkToNextFigure.innerHTML = locales(pageLanguage).nav.next;
  linkToNextFigure.innerHTML = 'Next'
  const figureTitle = figure.querySelector('.title')
  if (figureTitle) {
    figureTitle.insertAdjacentElement('beforeEnd', linkToNextFigure)
  }
}

function ebFigureAdvancerFigures (slide) {
  const figures = slide.querySelectorAll('.figure')
  figures.forEach(function (figure, index) {
    if (figure.nextElementSibling !== null) {
      const nextFigureId = figure.nextElementSibling.getAttribute('id')
      ebFigureAdvancerAddLinks(figure, nextFigureId)
    }
  })
}

function ebFigureAdvancer () {
  if (!ebFigureAdvancerInit()) return
  const slides = document.querySelectorAll('.slides')
  slides.forEach(function (slide) {
    ebFigureAdvancerFigures(slide)
  })
}

ebFigureAdvancer()
