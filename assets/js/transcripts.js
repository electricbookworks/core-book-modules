/* jslint browser */

export default function ebTranscripts () {
  // Rearrange the elements in the transcript files for ease of styling

  // Only transcript files contain the timestamp class
  if (document.querySelector('.timestamp')) {
    const speechParagraphs = document.querySelectorAll('.content p')
    speechParagraphs.forEach(function (para) {
      const timestamp = para.querySelector('em.timestamp')
      const linebreak = document.createElement('br')

      // Encapsulate speaker name and timestamp in a span for CSS
      const wrapperSpan = document.createElement('span')
      wrapperSpan.classList.add('name-and-timestamp')

      // Monologue transcripts don't have speaker names
      if (para.querySelector('strong')) {
        const speakerName = para.querySelector('strong')
        wrapperSpan.appendChild(speakerName)
      }

      wrapperSpan.appendChild(timestamp)
      wrapperSpan.appendChild(linebreak)

      para.prepend(wrapperSpan)
    })
  }
}
