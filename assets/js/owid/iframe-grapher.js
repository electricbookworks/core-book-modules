// Runs inside the sandboxed OWID iframe. Importing the CSS and grapher bundle
// here means style-loader and the grapher's 3rd party styles and scripts inject into the
// iframe's own document, so nothing leaks between the page and the chart.
// Bundled by webpack into assets/js/dist/owid-iframe.dist.js.

import './grapher.css'
import { GrapherLoader } from './grapher.standalone.min.js'

const deployType = process.env.config['deploy-type']
const externalMedia = process.env.settings['remote-media'][deployType]
const id = window.ebOwidId
const book = window.ebOwidBook
const baseUrl = `${externalMedia || ''}/${book}/data/owid/${id}`

const prepareData = async () => {
  const csvUrl = `${baseUrl}/data.csv`
  const configRaw = await (await fetch(`${baseUrl}/config.json`)).json()
  const columnIds = configRaw.dimensions.map(d => d.variableId)
  const columnPromises = columnIds.map(columnId => fetch(`${baseUrl}/${columnId}.metadata.json`).then(res => res.json()))
  const columnDefsRaw = await Promise.all(columnPromises)
  const columnDefs = columnDefsRaw.map(def => {
    def.type === 'float' && (def.type = 'Numeric')
    def.slug = def.shortName
    return def
  })
  const config = {
    ...configRaw
  }
  columnDefs.forEach(columnDef => {
    const dimension = config.dimensions.find(d => d.variableId === columnDef.id)
    if (dimension) dimension.slug = columnDef.shortName
  })
  return { config, csvUrl, columnDefs }
}

prepareData().then(({ config, csvUrl, columnDefs }) => {
  GrapherLoader.fromCsv({
    config,
    csvUrl,
    columnDefs
  }).mount(document.getElementById('owid-mount'))
})
