// Configuration and functionality for Electron apps

const {
  app,
  BrowserWindow,
  shell,
  session
} = require('electron')

const createWindow = () => {
  // First create new window, but hide it until we've loaded the content
  const win = new BrowserWindow({
    show: false
  })

  // Load the homepage
  win.loadFile('www/index.html')

  // Set the window size to the system maximum, then show it
  win.maximize()
  win.show()

  // Then customise the experience within the app window
  // Open external links in default system browser, rather than in Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// Go
app.whenReady().then(() => {
  const filter = {
    urls: ['*://*.youtube-nocookie.com/*', '*://*.youtube.com/*', '*://*.googlevideo.com/*']
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headers = details.requestHeaders
    headers.Referer = 'https://www.google.com/'
    // eslint-disable-next-line n/no-callback-literal
    callback({ cancel: false, requestHeaders: headers })
  })
  createWindow()
})

// Quit app when window is closed, on all platforms.
app.on('window-all-closed', () => {
  app.quit()
})
