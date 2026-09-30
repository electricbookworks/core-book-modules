import { GrapherLoader } from './grapher.standalone.min.js'
import './grapher.scss'

const ebOwidPrepareData = async ({ id }) => {
  const baseUrl = `/assets/data/owid/${id}`
  const csvUrl = `${baseUrl}/data.csv`
  const configRaw = await (await fetch(`${baseUrl}/config.json`)).json()
  const columnIds = configRaw.dimensions.map(d => d.variableId)
  const columnPromises = columnIds.map(id => fetch(`${baseUrl}/${id}.metadata.json`).then(res => res.json()))
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

const ebOwidGraphMount = async ({ id, containerId }) => {
  const { config, csvUrl, columnDefs } = await ebOwidPrepareData({ id })
  GrapherLoader.fromCsv({
    config,
    csvUrl,
    columnDefs
  }).mount(document.getElementById(containerId))
}

export { ebOwidGraphMount }
