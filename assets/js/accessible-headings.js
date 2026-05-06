// Make sure heading levels are sequential
export default function ebAccessibleHeadings () {
  const prerequisiteHeadings = document.querySelectorAll('.prerequisites h3')
  if (prerequisiteHeadings) {
    prerequisiteHeadings.forEach(function (h3) {
      const contents = h3.innerHTML
      const newH2 = document.createElement('h2')
      newH2.innerHTML = contents
      h3.insertAdjacentElement('afterend', newH2)
      h3.remove()
    })
  }
}
