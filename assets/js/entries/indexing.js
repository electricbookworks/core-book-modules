import ebIndexLists from '../index-lists'

if (process.env.settings['dynamic-indexing'] !== false && (process.env.output === 'web' || process.env.output === 'app')) {
  const bookIndexFileExists = process.env.bookIndexFiles && process.env.bookIndexFiles.includes(process.env.output)
  const ebIndexTargets = bookIndexFileExists ? require(`@indexes/book-index-${process.env.output}`) : []
  /*
    Script that adds index-reference links.
    This is used both in the browser
    and by gulp for PDF and epub outputs.
  */
  ebIndexLists(ebIndexTargets)
}
