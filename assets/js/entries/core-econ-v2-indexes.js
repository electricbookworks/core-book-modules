import ebIndexLists from '../index-lists'

if (process.env.settings['dynamic-indexing'] !== false && (process.env.output === 'web' || process.env.output === 'app')) {
  const bookIndexFileExists = process.env.bookIndexFiles && process.env.bookIndexFiles.includes(process.env.output)
  const ebIndexTargets = bookIndexFileExists ? require(`@indexes/book-index-${process.env.output}`) : []
  /*
    Script that adds index-reference links.
    This is done client-side in web and app, and pre-processed by gulp
    in PDF and epub outputs.
  */
  ebIndexLists(ebIndexTargets)
}
