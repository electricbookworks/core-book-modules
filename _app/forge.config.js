const path = require('path')
const { execSync } = require('child_process')
const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')

module.exports = {
  packagerConfig: {
    asar: true,
    appVersion: '2.1.1',
    icon: 'res/icon/electron/icon',
    name: 'The Economy 2 by CORE Econ',
    appBundleId: 'org.core-econ.books.the-economy',
    afterCopyExtraResources: [(stagingPath, electronVersion, platform, arch, done) => {
      if (platform !== 'darwin') return done()
      // Electron 35+ ships with linker-signed adhoc binaries. After
      // electron-packager renames and repackages the .app, these stale
      // signatures reference non-existent sealed resources, causing
      // codesign to fail. Strip all stale signatures so osx-sign can
      // re-sign everything cleanly from scratch.
      const appName = 'The Economy 2 by CORE Econ'
      const appPath = path.join(stagingPath, appName + '.app')
      try {
        execSync(
          'find "' + appPath + '" -type f \\( -perm /111 -o -name "*.dylib" \\) ' +
          '-exec codesign --remove-signature {} \\; 2>/dev/null',
          { stdio: 'ignore' }
        )
        execSync('codesign --remove-signature "' + appPath + '" 2>/dev/null', { stdio: 'ignore' })
      } catch (e) {
        // Ignore errors — some files may not have signatures
      }
      done()
    }],
    osxSign: {
      identity: 'Developer ID Application: Electric Book Works (Pty) Ltd. (867SMWFNSQ)',
      entitlements: path.resolve(__dirname, 'entitlements.plist'),
      entitlementsInherit: path.resolve(__dirname, 'entitlements.plist'),
      continueOnError: false
    },
    osxNotarize: {
      // key is not committed to the repository, get from 1Password.
      appleApiKey: path.resolve(__dirname, 'apple-api-key/AuthKey_4A7FNCCUK9.p8'),
      appleApiKeyId: '4A7FNCCUK9',
      appleApiIssuer: '3b54bda4-c219-4400-bb1c-efd9c9630f80'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-appx',
      config: {
        assets: path.resolve(__dirname, 'res/icon/windows'),
        certPass: '',
        devCert: '',
        makeVersionWinStoreCompatible: true,
        packageDescription: 'An open-access textbook for any first course in economics, whether principles, micro, or macro.',
        packageDisplayName: 'The Economy 2 by CORE Econ',
        packageName: 'EBW.TheEconomy2byCOREEcon',
        packageVersion: '2.1.1.0',
        publisher: 'CN=605D56E7-3B41-4152-B0D8-39A6751462A4',
        publisherDisplayName: 'Electric Book Works'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
}
