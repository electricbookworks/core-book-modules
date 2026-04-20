// Inject the Prince refine script into the merged HTML
// so that Prince can detect and fix layout issues during rendering.

const fs = require('fs-extra')
const fsPath = require('path')

// Inject the refine script into the merged HTML file.
// The script is added as an inline <script> in the <head>,
// before any other scripts, so it runs first.
function injectRefineScript (mergedHtmlPath) {
  const scriptPath = fsPath.join(__dirname, 'prince-refine.prince')
  const scriptContent = fs.readFileSync(scriptPath, 'utf8')

  let html = fs.readFileSync(mergedHtmlPath, 'utf8')

  // Build the script tag
  const scriptTag = '<script data-refine="true">\n' +
    scriptContent + '\n' +
    '</script>'

  // Insert before </head> if possible, otherwise before </body>
  if (html.includes('</head>')) {
    html = html.replace('</head>', scriptTag + '\n</head>')
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', scriptTag + '\n</body>')
  } else {
    // Append to end as fallback
    html += '\n' + scriptTag
  }

  fs.writeFileSync(mergedHtmlPath, html)
  return true
}

// Remove the refine script from the merged HTML
// (cleanup after Prince has run).
function removeRefineScript (mergedHtmlPath) {
  let html = fs.readFileSync(mergedHtmlPath, 'utf8')
  html = html.replace(/<script data-refine="true">[\s\S]*?<\/script>\n?/g, '')
  fs.writeFileSync(mergedHtmlPath, html)
}

// Inject the refine script in highlight-only mode.
// Adds a global flag so the script detects issues and adds
// .unfixed-refinement-issue classes without applying fixes.
function injectHighlightScript (mergedHtmlPath) {
  const scriptPath = fsPath.join(__dirname, 'prince-refine.prince')
  const scriptContent = fs.readFileSync(scriptPath, 'utf8')

  let html = fs.readFileSync(mergedHtmlPath, 'utf8')

  // Prepend the highlight-only flag before the script content
  const scriptTag = '<script data-refine-highlight-script="true">\n' +
    'var REFINE_HIGHLIGHT_ONLY = true;\n' +
    scriptContent + '\n' +
    '</script>'

  if (html.includes('</head>')) {
    html = html.replace('</head>', scriptTag + '\n</head>')
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', scriptTag + '\n</body>')
  } else {
    html += '\n' + scriptTag
  }

  fs.writeFileSync(mergedHtmlPath, html)
}

// Remove the highlight-only script from the merged HTML.
function removeHighlightScript (mergedHtmlPath) {
  let html = fs.readFileSync(mergedHtmlPath, 'utf8')
  html = html.replace(/<script data-refine-highlight-script="true">[\s\S]*?<\/script>\n?/g, '')
  fs.writeFileSync(mergedHtmlPath, html)
}

// Inject a <style> block into the merged HTML that highlights
// elements with tighten/loosen classes applied by refinement.
// This makes applied fixes visible in the refined PDF.
function injectHighlightStyles (mergedHtmlPath) {
  let html = fs.readFileSync(mergedHtmlPath, 'utf8')

  // Highlight all elements that have a tighten or loosen class,
  // and elements flagged as unfixed refinement issues.
  const styleTag = '<style data-refine-highlight="true">\n' +
    '[class*="tighten-"] { background-color: #d6eaff; } /* pale blue for tightened */\n' +
    '[class*="loosen-"] { background-color: #ffedcc; } /* pale orange for loosened */\n' +
    '.unfixed-refinement-issue { background-color: #ffd6d6; } /* pale pink for unfixed issues */\n' +
    '</style>'

  if (html.includes('</head>')) {
    html = html.replace('</head>', styleTag + '\n</head>')
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', styleTag + '\n</body>')
  } else {
    html += '\n' + styleTag
  }

  fs.writeFileSync(mergedHtmlPath, html)
}

// Remove the highlight styles from the merged HTML.
function removeHighlightStyles (mergedHtmlPath) {
  let html = fs.readFileSync(mergedHtmlPath, 'utf8')
  html = html.replace(/<style data-refine-highlight="true">[\s\S]*?<\/style>\n?/g, '')
  fs.writeFileSync(mergedHtmlPath, html)
}

module.exports = {
  injectRefineScript,
  removeRefineScript,
  injectHighlightScript,
  removeHighlightScript,
  injectHighlightStyles,
  removeHighlightStyles
}
