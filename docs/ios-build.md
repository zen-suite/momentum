# iOS Build With Embedded JS Bundle

This guide builds the app for a real iPhone with an automation script that runs `xcodebuild` and embeds the JS bundle inside the app package.

## Why this build type

A `Release` build includes `main.jsbundle` inside the `.app`.
This avoids the runtime error:

`No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle.`

## Prerequisites

1. Xcode is installed
2. `npx` is available
3. iPhone is connected and trusted
4. Developer Mode is enabled on the iPhone
5. Code signing team is configured
6. `ios-deploy` can run via `npx ios-deploy`

## Find required values

### 1) `YOUR_TEAM_ID`

In Xcode:

1. Open `ios/Momentum.xcworkspace`
2. Select target `Momentum`
3. Open `Signing & Capabilities`
4. Read the Team value

Or from terminal (when `ios/` already exists):

```bash
grep -oE 'DEVELOPMENT_TEAM = [A-Z0-9]+' ios/Momentum.xcodeproj/project.pbxproj | head -n 1 | awk '{print $3}'
```

### 2) `YOUR_DEVICE_UDID`

List connected devices:

```bash
xcrun xctrace list devices
```

Copy the long ID in parentheses for your iPhone.

## Build and install with script

Run from repo root:

```bash
./scripts/release-ios-device.sh
```

The script prompts for:

1. `device_id` (iPhone UDID)
2. `team_id` (Apple Developer Team ID)

Then it runs:

1. `npx expo prebuild --platform ios`
2. `xcodebuild` Release build for the provided device/team
3. JS bundle verification (`main.jsbundle`)
4. Device install via `npx ios-deploy`

## Troubleshooting

1. Signing error: open `ios/Momentum.xcworkspace` in Xcode, set Team for target `Momentum`, then run build again.
2. Device install fails: make sure iPhone is unlocked, trusted, and Developer Mode is enabled.
3. `main.jsbundle` missing: re-run the script and confirm Step 2 (`xcodebuild`) completed successfully.
