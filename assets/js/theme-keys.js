// theme-keys.js — Relocate theme-key discs into section headings.
//
// In the source content each `.theme-key` block sits immediately before the
// section it describes. This module moves that block into the section's <h2>
// so the accordion heading advertises the section's themes:
//   * closed heading  → just the coloured discs, inline on the heading;
//   * open heading     → each disc with its `.theme-key-label`, stacked below.
// The unit-opener summary block (marked `.hide-theme-key`) duplicates the
// per-section keys, so it is removed rather than relocated.
//
// It runs after the accordion has built the heading buttons, so the
// `.content > h2` headings and their `aria-expanded` buttons already exist.
// It is a no-op on pages without `.theme-key` blocks. Only The Economy uses
// themes today, but it lives here so any book can reuse the feature.

export default function ebThemeKeys () {
  // Guard against non-browser environments (e.g. server-side bundling).
  if (typeof document === 'undefined') {
    return
  }

  // Wait for the DOM (and the accordion markup) before relocating anything.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', relocateThemeKeys)
  } else {
    relocateThemeKeys()
  }
}

function relocateThemeKeys () {
  // Snapshot the blocks and headings up front; both lists stay valid while we
  // move elements around because querySelectorAll returns a static NodeList.
  const wrappers = document.querySelectorAll('.theme-key')

  if (wrappers.length === 0) {
    return
  }

  const headings = Array.prototype.slice.call(
    document.querySelectorAll('.content > h2')
  )

  wrappers.forEach(function (wrapper) {
    // Drop the opener summary key: it repeats the per-section keys below it.
    if (wrapper.classList.contains('hide-theme-key')) {
      wrapper.parentNode.removeChild(wrapper)
      return
    }

    // Target the first heading that follows this block in document order.
    const heading = headings.find(function (candidate) {
      return Boolean(
        wrapper.compareDocumentPosition(candidate) &
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })

    if (heading) {
      // Move the whole block so its disc links stay grouped in one wrapper.
      heading.appendChild(wrapper)
      // Tell the CSS how many discs to reserve heading space for when closed.
      heading.style.setProperty(
        '--theme-key-count',
        wrapper.querySelectorAll('.theme-key-theme').length
      )
    } else {
      // No following heading means the block has nowhere to live; remove it.
      wrapper.parentNode.removeChild(wrapper)
    }
  })
}
