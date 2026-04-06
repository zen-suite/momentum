# iOS Build With Embedded JS Bundle

This guide builds the app for a real iPhone with `xcodebuild` and embeds the JS bundle inside the app package.

## Why this build type

A `Release` build includes `main.jsbundle` inside the `.app`.
This avoids the runtime error:

`No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle.`

## Prerequisites

1. Xcode is installed
2. CocoaPods dependencies are installed in `ios/`
3. iPhone is connected and trusted
4. Developer Mode is enabled on the iPhone
5. Code signing team is configured

## Find required values

### 1) `Momentum` and workspace

List iOS project files:

```bash
ls ios
```

Use these patterns:

1. Workspace: `ios/Momentum.xcworkspace`
2. Scheme: usually `Momentum`

If you are unsure about scheme names:

```bash
xcodebuild -list -workspace ios/Momentum.xcworkspace
```

### 2) `REVERSE_DOMAIN_BUNDLE_ID`

Check `app.json`:

```bash
cat app.json
```

Find:

`expo.ios.bundleIdentifier`

### 3) `YOUR_TEAM_ID`

In Xcode:

1. Open `ios/Momentum.xcworkspace`
2. Select target `Momentum`
3. Open `Signing & Capabilities`
4. Read the Team value

### 4) `YOUR_DEVICE_UDID`

List connected devices:

```bash
xcrun xctrace list devices
```

Copy the long ID in parentheses for your iPhone.

Values used below:

1. Workspace: `ios/Momentum.xcworkspace`
2. Scheme: `Momentum`
3. Bundle ID: `<REVERSE_DOMAIN_BUNDLE_ID>`
4. Team ID: `YOUR_TEAM_ID`
5. Device UDID: `YOUR_DEVICE_UDID`

## Step 1: Build Release for device

Run from repo root:

```bash
xcodebuild \
  -workspace ios/Momentum.xcworkspace \
  -scheme Momentum \
  -configuration Release \
  -destination 'id=YOUR_DEVICE_UDID' \
  -derivedDataPath ios/build \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID \
  build
```

## Step 2: Verify JS bundle exists

```bash
ls ios/build/Build/Products/Release-iphoneos/Momentum.app/main.jsbundle
```

If this file exists, the JS bundle is embedded correctly.

## Step 3: Install on device

```bash
npx ios-deploy \
  -i YOUR_DEVICE_UDID \
  -b ios/build/Build/Products/Release-iphoneos/Momentum.app
```

## Troubleshooting

1. Signing error: open `ios/Momentum.xcworkspace` in Xcode, set Team for target `Momentum`, then run build again.
2. Device install fails: make sure iPhone is unlocked, trusted, and Developer Mode is enabled.
3. `main.jsbundle` missing: confirm you built with `-configuration Release`.
