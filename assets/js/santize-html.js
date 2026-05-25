/* global DOMParser, Node */

/*
This works by parsing the input with DOMParser
(sandboxed — no scripts execute during parsing),
then walking the resulting DOM tree and rebuilding it:
text nodes are copied as plain text,
elements in the allowlist are recreated without any attributes
(so no onerror=, onclick=, etc.), and anything else — <script>, <img>, <a>, unknown tags —
is silently stripped while its text content is preserved.
*/
export default function ebSanitizeHtml (html) {
  const allowed = ['EM', 'I', 'STRONG', 'B', 'SUP', 'SUB']

  const doc = new DOMParser().parseFromString(html, 'text/html')

  function clean (node) {
    const fragment = document.createDocumentFragment()
    node.childNodes.forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        fragment.appendChild(document.createTextNode(child.textContent))
      } else if (child.nodeType === Node.ELEMENT_NODE && allowed.includes(child.tagName)) {
        const el = document.createElement(child.tagName.toLowerCase())
        el.appendChild(clean(child))
        fragment.appendChild(el)
      } else {
        fragment.appendChild(clean(child))
      }
    })
    return fragment
  }

  return clean(doc.body)
}
