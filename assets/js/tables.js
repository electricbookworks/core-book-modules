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

function ebTables () {
  const tables = document.querySelectorAll('table')

  tables.forEach(function (table) {
    // Wrap each table in a .table-wrapper div
    const tableWrapper = document.createElement('div')
    tableWrapper.classList.add('table-wrapper')
    table.parentNode.insertBefore(tableWrapper, table)
    tableWrapper.appendChild(table)

    // Make the tables more accessible
    ebMakeTablesMoreAccessible(table)
  })
}

export default ebTables
