## Build Windows and Mac

Run on a Mac for Mac; on a Windows machine for Windows:

```
npm run eb -- output -f app -o electron -d true -l <language>
```

## Release Windows

WIP

## Release Mac

The Mac app is notorised, via Apple App Store Connect. This requires a key, available from the EBW password manager (1Password), called "EBW Apple App Store Connect API key". Add this to `./apple-api-key`. The contents of this directory is ignored by Git. Do not commit the key.

Consult relevant PL for where to upload the app for distribution.

## Build and release Android

https://kb.electricbookworks.com/en/create/production/android-apps