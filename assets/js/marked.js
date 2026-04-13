// Conditionally import marked only for web and app outputs.
// Marked is not compatible with PrinceXML and EPUBs.
let marked = null
if (process.env.output === 'web' || process.env.output === 'app') {
  marked = (await import('marked')).marked
}
export default marked
