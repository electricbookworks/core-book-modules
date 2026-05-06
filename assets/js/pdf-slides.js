// Move summaries of slidelnies that have slide text
// in the sidebar to the end of the slides div,
// so that the sidebar slides can float to the sidebar.
export default function ebPdfSlides () {
  const sidebarSlidesSummaries = document.querySelectorAll('.pdf-sidebar-slides .summary')

  if (sidebarSlidesSummaries) {
    sidebarSlidesSummaries.forEach(function (summarySlide) {
      // Note: Prince does not support parentElement apparently,
      // so we have use parentNode.
      const slidesDiv = summarySlide.parentNode
      slidesDiv.appendChild(summarySlide)
    })
  }
}
