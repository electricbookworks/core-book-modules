/* global localStorage */

import { locales, pageLanguage } from './locales.js'
import { ebInIframe } from './utilities.js'

// There are two reasons why we might interact with this script:

// The first is when we land on the new server for the very first time. In this
// case, we need to send the user to the migration page on the old server, and
// send along the page that they are currently on, so that they can get back
function ebFetchBookmarks () {
  document.cookie = 'bookmarksMigrated=true; expires=Tue, 1 Jan 2030 23:59:59 UTC;path=/;'
  const href = window.location.href
  window.location.href = 'https://www.core-econ.org/migrate/bookmarks.html?from=' + href
}

// Thanks https://evanhahn.com/javascript-compression-streams-api-with-strings/
// Decompress bytes into a UTF-8 string.
async function decompress (compressedBytes) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream()

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream('gzip')
  )

  // Read all the bytes from this stream.
  const chunks = []
  for await (const chunk of decompressedStream) {
    chunks.push(chunk)
  }
  const stringBytes = await concatUint8Arrays(chunks)

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes)
}

// Combine multiple Uint8Arrays into one.
async function concatUint8Arrays (uint8arrays) {
  const blob = new Blob(uint8arrays)
  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}

function ebExpandBookmarkObject (key, object) {
  // We shrank the bookmark object before we compressed it, so now we need to
  // expand it again after decompression.
  const newObject = {}
  newObject.sessionDate = object.s
  newObject.bookTitle = object.b
  newObject.pageTitle = object.p
  newObject.description = object.d
  newObject.id = object.i
  newObject.fingerprint = object.f
  newObject.location = window.location.origin + object.l
  newObject.key = key
  newObject.type = 'userBookmark'

  return JSON.stringify(newObject)
}

// The second is when we land back here on the new server, but now with the query
// parameter from the old server that contains the encoded bookmarks. Now we need
// to decode that string and stick the bookmarks in localStorage here on the new
// server
async function ebStoreMigratedBookmarks () {
  const href = window.location.href
  if (href.includes('?bookmarks=')) {
    async function ebExtractBookmarks () {
      // Steps: URI > string > bytestream > string > expand > JSON > localStorage

      const params = new URLSearchParams(window.location.search)
      const bookmarksComponent = params.get('bookmarks')

      // Not all browsers will support the Compression Stream API, so we need cases
      // for both scenarios. Fewer bookmarks are better than none.
      let bookmarks
      if ('CompressionStream' in window && 'DecompressionStream' in window) {
        const bookmarksArray = new Uint8Array(bookmarksComponent.split('-').map(Number))
        const bookmarksString = await decompress(bookmarksArray)
        bookmarks = JSON.parse(bookmarksString)
      } else {
        bookmarks = JSON.parse(decodeURIComponent(bookmarksComponent))
      }

      Object.keys(bookmarks).forEach(key => {
        localStorage.setItem(key, ebExpandBookmarkObject(key, bookmarks[key]))
      })
    }

    await ebExtractBookmarks()

    // Remove query from page URL to allow normal page load (e.g. youtube iframe
    // fails if long search parameter is left in the URL)
    window.location.href = window.location.href.replace(window.location.search, '')
  } else if (href.includes('?alert=true')) {
    // Alert the user that they have too many bookmarks to transfer
    window.alert(locales[pageLanguage].bookmarks['migration-alert'])
  }
}

async function ebMigrateBookmarks () {
  if (!document.cookie.includes('bookmarksMigrated')) {
    ebFetchBookmarks()
  }

  await ebStoreMigratedBookmarks()
}

export default function ebMigrateStorage () {
  if (!ebInIframe()) {
    ebMigrateBookmarks()
  }
}
