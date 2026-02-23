// Return array of switches for Jekyll
function jekyllSwitches (argv) {
  const switchesArray = []

  // Add incremental switch if --incremental=true
  if (argv.incremental) {
    switchesArray.push('--incremental')
  }

  // Add switches passed as a --switches="" argv
  if (argv.switches) {
    let switchesString = ''

    // Strip quotes that might have been added around arguments by user
    switchesString = argv.switches.replace(/'/g, '').replace(/"/g, '')

    // Replace spaces with commans, then split the string into an array,
    // and loop through the array adding each string to switchesArray.
    const switchesStringAsArray = switchesString.replace(/\s/g, ',').split(',')
    switchesStringAsArray.forEach(function (switchString) {
      switchesArray.push(switchString)
    })
  }

  return switchesArray
}

module.exports = jekyllSwitches
