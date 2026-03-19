#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const { spawnSync } = require('child_process')
const os = require('os')

async function syncMedia () {
  // Determine parent package root
  const moduleRoot = __dirname
  let parentRoot = path.resolve(moduleRoot, '../../..')

  if (moduleRoot.includes('node_modules')) {
    const nodeModulesIndex = moduleRoot.lastIndexOf('node_modules')
    if (nodeModulesIndex !== -1) {
      parentRoot = moduleRoot.substring(0, nodeModulesIndex - 1)
    }
  }

  // Read the parent's package.json
  const parentPkgPath = path.join(parentRoot, 'package.json')
  if (!await fs.pathExists(parentPkgPath)) {
    console.error('No package.json found in parent directory:', parentRoot)
    process.exit(1)
  }

  const parentPkg = await fs.readJson(parentPkgPath)

  if (!parentPkg.media || !parentPkg.media.url) {
    console.error('No media.url defined in parent package.json')
    process.exit(1)
  }

  if (!parentPkg.media.folders || !parentPkg.media.folders.length) {
    console.error('No media.folders defined in parent package.json')
    process.exit(1)
  }

  const mediaUrl = parentPkg.media.url
  const mediaFolders = parentPkg.media.folders

  console.log('Syncing media from:', mediaUrl)
  console.log('Folders:', mediaFolders.join(', '))

  // Clone into a temp directory
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eb-media-'))

  try {
    console.log('Cloning media repository...')
    const result = spawnSync('git', ['clone', '--depth', '1', mediaUrl, tmpDir], {
      stdio: 'inherit'
    })
    if (result.status !== 0) {
      throw new Error('Failed to clone media repository')
    }

    // Copy each specified folder non-destructively
    for (const folder of mediaFolders) {
      const sourcePath = path.join(tmpDir, folder)
      const destPath = path.join(parentRoot, folder)

      if (!await fs.pathExists(sourcePath)) {
        console.warn('Warning: folder "' + folder + '" not found in media repository, skipping')
        continue
      }

      console.log('Copying ' + folder + '...')

      // fs.copy adds and overwrites files but never removes
      // files that exist only in the destination
      await fs.copy(sourcePath, destPath, {
        overwrite: true,
        preserveTimestamps: true,
        errorOnExist: false
      })
    }

    console.log('Media sync complete.')
  } finally {
    await fs.remove(tmpDir)
  }
}

syncMedia().catch(function (err) {
  console.error('Error syncing media:', err.message)
  process.exit(1)
})
