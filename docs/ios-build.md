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
./scripts/release-ios-device.sh -d YOUR_DEVICE_UDID -t YOUR_TEAM_ID
```

If args are omitted, the script prompts for:

1. `device_id` (iPhone UDID)
2. `team_id` (Apple Developer Team ID)

Then it runs:

1. `npx expo prebuild --platform ios`
2. `(cd ios && pod install)`
3. Pod verification (ensures task manager/background task/notifications pods are linked, including SDK-specific names such as `EXTaskManager`/`EXNotifications` or `ExpoTaskManager`/`ExpoNotifications`)
4. `npx expo export:embed --platform ios --dev false --bundle-output ios/build/prebundle/main.jsbundle --assets-dest ios/build/prebundle`
5. `xcodebuild` Release build for the provided device/team
6. JS bundle verification (`main.jsbundle`)
7. Device install via `npx ios-deploy`

## Troubleshooting

1. Signing error: open `ios/Momentum.xcworkspace` in Xcode, set Team for target `Momentum`, then run build again.
2. Device install fails: make sure iPhone is unlocked, trusted, and Developer Mode is enabled.
3. `main.jsbundle` missing: re-run the script and confirm Step 5 (`xcodebuild`) completed successfully.
4. `PhaseScriptExecution Bundle React Native code and images` with `EPERM ... main.jsbundle`: this is usually caused by `ENABLE_USER_SCRIPT_SANDBOXING = YES` in the app target. The script now auto-patches `ios/Momentum.xcodeproj/project.pbxproj` to set it to `NO` after `expo prebuild`.
5. Notes such as `Run script build phase ... will be run during every build` and warnings about `IPHONEOS_DEPLOYMENT_TARGET` from `Pods.xcodeproj` are not fatal by themselves.
6. If Step 5 fails with provisioning errors mentioning `Push Notifications capability` or `aps-environment entitlement` on a personal team, the script automatically removes `aps-environment` from `ios/Momentum/Momentum.entitlements` and retries once.
7. If the app opens and closes immediately with `Cannot find native module 'ExpoTaskManager'`, native Expo pods were not linked in the built app. Re-run the script (it now runs `pod install` and verifies required Expo pods before build).
