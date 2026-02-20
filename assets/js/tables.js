function ebMakeTablesMoreAccessible (table) {
  // Add scope="col" to any <th> inside <thead>
  const theadElements = table.querySelectorAll('thead')

  if (theadElements) {
    theadElements.forEach(function (theadElement) {
      const thElements = theadElement.querySelectorAll('th')
      if (thElements) {
        thElements.forEach(function (thElement) {
          thElement.setAttribute('scope', 'col')
        })
      }
    })
  }

  // Sometimes html tables are added in the markdown without <thead>
  // Safe to assume that any <th> that is in the first <tr> of a table
  // is a column header and needs scope="col"
  // Keeping this separate from the previous query just in case
  const headlessThElements = table.querySelectorAll(
    ':not(thead) > tr:first-of-type > th'
  )

  if (headlessThElements) {
    headlessThElements.forEach(function (headlessThElement) {
      headlessThElement.setAttribute('scope', 'col')
    })
  }

  // Add scope="row" to any <th> that has a rowspan attribute
  const rowSpanElements = table.querySelectorAll('th[rowspan]')

  if (rowSpanElements) {
    rowSpanElements.forEach(function (rowSpanElement) {
      rowSpanElement.setAttribute('scope', 'row')
    })
  }

  // Instances of <td class="table-row-stub"> need to change to
  // <th class="table-row-stub" scope="row">
  const rowStubElements = table.querySelectorAll('.table-row-stub')
  if (rowStubElements) {
    rowStubElements.forEach(function (rowStubElement) {
      const newRowStubElement = document.createElement('th')
      newRowStubElement.setAttribute('scope', 'row')
      newRowStubElement.classList.add('table-row-stub')
      newRowStubElement.innerHTML = rowStubElement.innerHTML

      rowStubElement.insertAdjacentElement('afterend', newRowStubElement)

      rowStubElement.remove()
    })
  }

  // Empty <th> elements need to be replaced with <td>s for accessibility
  const allTHelements = table.querySelectorAll('th')
  allTHelements.forEach(function (th) {
    if (th.innerText.trim() === '') {
      const newTD = document.createElement('td')
      th.insertAdjacentElement('afterend', newTD)
      th.remove()
    }
  })
}

function ebPositionTable (tableWrapper) {
  // Get the table
  const table = tableWrapper.querySelector('table')

  // Reset table positioning
  table.style.transform = 'none'
  table.classList.remove('scrolling-table')

  // Get widths for responsiveness calculations
  const tableWrapperWidth = tableWrapper.getBoundingClientRect().width
  const tableWidth = table.getBoundingClientRect().width
  const bodyWidth = document.body.getBoundingClientRect().width
  const remainingWidth = bodyWidth - tableWidth
  const shiftLeftToCenter = (tableWidth - tableWrapperWidth) / 2

  // Center the table in the screen area
  // if it's wider than the text area, and
  // there is space left and right to shift into.
  if (tableWidth > tableWrapperWidth &&
            remainingWidth > 0) {
    table.style.transform = 'translateX(-' + shiftLeftToCenter + 'px)'
  }

  // If the table is wider than the viewport,
  // add class `responsive-table` so we can scroll with CSS.
  if (remainingWidth < 0) {
    table.classList.add('scrolling-table')
  }
}

function ebPositionAllTables () {
  const tableWrappers = document.querySelectorAll('.table-wrapper')

  let i
  for (i = 0; i < tableWrappers.length; i += 1) {
    ebPositionTable(tableWrappers[i])
  }
}

let resizeTimeout

// Only resize tables when resizing has stopped for 1s
function ebPositionTablesWhenResizingCompletes () {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(ebPositionAllTables, 1000)
}

function ebTables () {
  const supported = navigator.userAgent.indexOf('Opera Mini') === -1 &&
            document.querySelector !== undefined &&
            !!Array.prototype.forEach

  if (!supported) {
    return
  }

  const tables = document.querySelectorAll('table')

  tables.forEach(function (table) {
    // make the wrapper and add a class
    const tableWrapper = document.createElement('div')
    tableWrapper.classList.add('table-wrapper')

    // add the wrapper to the DOM
    table.parentNode.insertBefore(tableWrapper, table)

    // move the table inside the wrapper
    tableWrapper.appendChild(table)

    // make the tables more accessible
    ebMakeTablesMoreAccessible(table)

    // Position the table
    ebPositionTable(tableWrapper)
  })

  // Listen for changes to screen size. If sizes changes,
  // reposition the tables.
  window.addEventListener('resize', ebPositionTablesWhenResizingCompletes)
}

export default ebTables
