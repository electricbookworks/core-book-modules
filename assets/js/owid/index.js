// Builds a sandboxed iframe for an OWID chart. The iframe's document loads the
// grapher bundle and its CSS itself (via assets/js/dist/owid-iframe.dist.js),
// so page styles can't leak into the chart and the grapher's FontAwesome styles
// stay inside the iframe. The source is generated on the fly via srcdoc.
const ebOwidGraphMount = ({ id, containerId }) => {
  const baseurl = process.env.config.baseurl || ''
  const container = document.getElementById(containerId)
  const iframe = document.createElement('iframe')
  iframe.title = 'Interactive chart'
  iframe.style.cssText = 'width:100%;aspect-ratio:850/600;margin:2rem auto;border:0;display:block;background:#fff'
  iframe.srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{height:100%;margin:0}#owid-mount{height:100%}</style>
</head>
<body>
<div id="owid-mount"></div>
<script>window.__owidId__=${JSON.stringify(id)}</script>
<script src="${baseurl}/assets/js/dist/owid-iframe.dist.js"></script>
</body>
</html>`
  container.appendChild(iframe)
}

export { ebOwidGraphMount }
