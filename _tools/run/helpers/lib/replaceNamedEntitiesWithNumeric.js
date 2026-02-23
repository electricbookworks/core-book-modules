const fs = require('fs-extra')
const entities = require('entities')

// Replaced named entities with numeric entities
async function replaceNamedEntitiesWithNumeric (filePath) {
  try {
    // Read the file content
    const fileContent = await fs.readFile(filePath, 'utf8')

    // Process the content
    const processedContent = fileContent
      // Step 1: Handle escaped entities
      .replace(/\\(&[a-zA-Z0-9#]+;)/g, (match, entity) => {
        // Leave escaped entities unchanged
        return `ESCAPED_ENTITY_${entity}`
      })
      // Step 2: Replace non-escaped entities with numeric entities
      .replace(/&[a-zA-Z0-9#]+;/g, (match) => {
        // Decode the named entity
        const decodedChar = entities.decodeHTML(match)

        // Re-encode the character as a numeric (hex) entity
        return entities.encodeXML(decodedChar)
      })
      // Step 3: Restore escaped entities
      .replace(/ESCAPED_ENTITY_(&[a-zA-Z0-9#]+;)/g, (match, entity) => `\\${entity}`)

    // Write the processed content to the output file
    await fs.writeFile(filePath, processedContent, 'utf8')

    console.log(`Processed file saved to ${filePath}`)
  } catch (error) {
    console.error('Error processing file:', error)
  }
}

module.exports = replaceNamedEntitiesWithNumeric
