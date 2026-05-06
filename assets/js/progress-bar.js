const ebGetProgessValues = function (string) {
  const stringList = string.match(/\d+/g)
  return stringList.map(string => { return parseInt(string) })
}

const ebCreateProgressBar = function (list) {
  // Make a container
  // This container's width will be set in the CSS
  const progressBarContainer = document.createElement('div')
  progressBarContainer.classList.add('progress-bar-container')

  // Make the progress bar
  // This bar's width will be set here using the progress values
  // Its transition will be handled in the CSS
  const progressBar = document.createElement('div')
  progressBar.classList.add('progress-bar')

  // Give the progress bar the width we want
  const width = Math.round((list[0] / list[1]) * 100)
  progressBar.style.width = `${width}%`

  // Place in the page
  const mainDiv = document.querySelector('[role="main"]')
  progressBarContainer.appendChild(progressBar)
  mainDiv.insertAdjacentElement('afterbegin', progressBarContainer)
}

const ebProgressBar = function () {
  // First we need to get all the information
  // YAML frontmatter => head.html => data attributes on the wrapper

  const wrapperDiv = document.querySelector('.wrapper')
  if (wrapperDiv && wrapperDiv.hasAttribute('data-page-progress')) {
    const progressString = wrapperDiv.getAttribute('data-page-progress')

    const numberVals = ebGetProgessValues(progressString)

    // Now we have a list [x, y] where x is the number of this section, and
    // y is the total number of sections in the unit

    ebCreateProgressBar(numberVals)
  }
}

export default ebProgressBar
