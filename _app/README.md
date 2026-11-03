## Build and release Mac app

On a Mac, run:

```
npm run sync-media
```

And then:

```
npm run eb -- output -f app -o electron -d true -l <language>
```

The outputted .dmg installer in `_site/app/out/make/` can be used for both testing and release.

The Mac app is notorised, via Apple App Store Connect. This requires a key, available from the EBW password manager (1Password), called "EBW Apple App Store Connect API key". Add this to `./apple-api-key`. The contents of this directory is ignored by Git. Do not commit the key.

Consult relevant PL for where to upload the app for distribution.

## Build and release Windows app

On a Windows machine, run:

```
npm run sync-media
```

And then:

```
npm run eb -- output -f app -o electron -d true -l <language>
```

For testing, copy `_site/app/out/<name of project>` (the entire folder) to Dropbox for PL and others test. Testers must copy that entire folder onto their machine and then launch the .exe file in theat folder.

For release, upload the .appx file to the Microsoft App Store, outputted to `_site/app/out/make/appx/`

## Build and release Android app

https://kb.electricbookworks.com/en/create/production/android-apps