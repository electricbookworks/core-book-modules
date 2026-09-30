import { GrapherLoader } from './grapher.standalone.min.js'
import './grapher.scss'

// const ebOwidGraph = ({ id, config, csvUrl, columnDefs }) => {
const ebOwidGraph = ({ id }) => {
  GrapherLoader.fromCsv({
    // config: {
    //   title: 'Population',
    //   selectedEntityNames: ['France', 'Germany', 'Brazil']
    // },
    // csvUrl: 'http://127.0.0.1:4000/assets/data/owid/demo.csv',
    // columnDefs: [
    //   {
    //     slug: 'population',
    //     type: 'Numeric',
    //     name: 'Population',
    //     unit: 'million people',
    //     display: { numDecimalPlaces: 0 },
    //     descriptionShort: 'The number of people living in each country.',
    //     descriptionKey: 'These are made-up numbers for demo purposes.',
    //     sourceName: 'Demo Population Census (2024)',
    //     sourceLink: 'https://example.org/population-census',
    //     dataPublishedBy: 'Demo Data Institute',
    //     timespan: '2000-2020',
    //     origins: [
    //       {
    //         producer: 'Demo Data Institute',
    //         title: 'Demo Population Census',
    //         urlMain: 'https://example.org/population-census',
    //         dateAccessed: '2024-05-01',
    //         citationFull: 'Demo Data Institute (2024). Demo Population Census.'
    //       }
    //     ]
    //   }
    // ]
    config: {
      id: 3232,
      logo: 'core+owid',
      note: 'The units of measurement is 2011 US dollar which is used to compare Purchasing Power Parity and GDP across countries over time. CC-BY-ND-NC',
      slug: 'historys-hockey-stick-worldwide-historical-gross-domestic-product-percapita-1990',
      title: 'History’s hockey stick: Worldwide historical real gross domestic product per capita',
      yAxis: {
        max: 0,
        min: 0,
        canChangeScaleType: true
      },
      $schema: 'https://files.ourworldindata.org/schemas/grapher-schema.011.json',
      minTime: 1000,
      version: 28,
      subtitle: "Unit 1 'The capitalist revolution: prosperity, inequality, and planetary limits’ in The CORE Team, The Economy 2.0 Microeconomics. Available at: https://tinyco.re/19274920 [Figure 1.1]",
      hasMapTab: true,
      originUrl: 'https://tinyco.re/19274920',
      dimensions: [
        {
          display: {
            color: '#a652ba'
          },
          property: 'y',
          variableId: 1229275
        }
      ],
      isPublished: true,
      variantName: 'without Finland',
      internalNotes: 'core-econ.org',
      selectedEntityNames: [
        'United Kingdom',
        'Japan',
        'Italy',
        'India',
        'China'
      ],
      selectedEntityColors: {
        China: '#a652ba',
        India: '#000',
        Italy: '#34983f',
        Japan: '#ed6c2d',
        'United Kingdom': '#3360a9'
      }
    },
    csvUrl: 'http://127.0.0.1:4000/assets/data/owid/historys-hockey-stick-worldwide-historical-gross-domestic-product-percapita-1990/data.csv',
    columnDefs: [
      {
        id: 1229275,
        name: 'Real GDP per capita in 2011 US$',
        unit: '2011 US$',
        description: 'Measure of real GDP per capita accounts for inflation, i.e. changes in the price level, and is suitable for cross-country income comparisons.',
        createdAt: '2026-05-12T11:25:00.000Z',
        updatedAt: '2026-05-18T08:58:49.000Z',
        coverage: '',
        timespan: '1-2018',
        datasetId: 7908,
        shortUnit: '$',
        columnOrder: 0,
        shortName: 'real_gdp_per_capita_in_2011_usd',
        catalogPath: 'grapher/core_econ/2019-11-22/te_1_1/te_1_1#real_gdp_per_capita_in_2011_usd',
        type: 'float',
        dataChecksum: '14572567386925782408',
        metadataChecksum: '1368324384406832227',
        datasetName: 'TE-1.1',
        datasetVersion: '2019-11-22',
        nonRedistributable: false,
        display: {
          unit: '2011 US$',
          shortUnit: '$'
        },
        schemaVersion: 2,
        presentation: {},
        origins: [
          {
            id: 15048,
            title: 'Maddison Project Database',
            producer: 'Maddison Project Database',
            citationFull: "Maddison Project Database, version 2018. Bolt, Jutta, Robert Inklaar, Herman de Jong and Jan Luiten van Zanden (2018), \"Rebasing 'Maddison': new income comparisons and the shape of long-run economic development\", Maddison Project Working paper 10.",
            versionProducer: '2018',
            urlMain: 'https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2018',
            urlDownload: 'http://www.ggdc.net/maddison/oriindex.htm',
            dateAccessed: '2019-11-22',
            datePublished: '2018'
          }
        ]
      }
    ]
  }).mount(document.getElementById(id))
}

export default ebOwidGraph
