#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "app.json" ]]; then
  echo "Error: app.json not found. Run this script from the repository."
  exit 1
fi

BUNDLE_IDENTIFIER="$(node -e "const app=require('./app.json');process.stdout.write(app?.expo?.ios?.bundleIdentifier ?? '');")"

prompt_required() {
  local prompt_text="$1"
  local value=""

  while [[ -z "$value" ]]; do
    read -r -p "$prompt_text: " value
    if [[ -z "$value" ]]; then
      echo "Value is required."
    fi
  done

  echo "$value"
}

DEVICE_ID="$(prompt_required "Enter device_id (iPhone UDID)")"
TEAM_ID="$(prompt_required "Enter team_id (Apple Developer Team ID)")"

echo "Step 1/4: Regenerate iOS native project"
npx expo prebuild --platform ios

echo
WORKSPACE_PATH="${WORKSPACE_PATH:-$(find ios -maxdepth 1 -name "*.xcworkspace" -print -quit)}"
if [[ -z "$WORKSPACE_PATH" ]]; then
  echo "Error: No .xcworkspace file found in ios/ after prebuild."
  exit 1
fi

SCHEME_NAME="${SCHEME_NAME:-$(node -e "const app=require('./app.json');process.stdout.write(app?.expo?.name ?? '');")}"
if [[ -z "$SCHEME_NAME" ]]; then
  SCHEME_NAME="$(basename "$WORKSPACE_PATH" .xcworkspace)"
fi

DERIVED_DATA_PATH="ios/build"
APP_PATH="$DERIVED_DATA_PATH/Build/Products/Release-iphoneos/$SCHEME_NAME.app"
JS_BUNDLE_PATH="$APP_PATH/main.jsbundle"

echo "Workspace: $WORKSPACE_PATH"
echo "Scheme: $SCHEME_NAME"
echo "Bundle ID: ${BUNDLE_IDENTIFIER:-<not found in app.json>}"
echo "Device ID: $DEVICE_ID"
echo "Team ID: $TEAM_ID"
echo

echo
echo "Step 2/4: Build Release for device"
xcodebuild \
  -workspace "$WORKSPACE_PATH" \
  -scheme "$SCHEME_NAME" \
  -configuration Release \
  -destination "id=$DEVICE_ID" \
  -derivedDataPath "$DERIVED_DATA_PATH" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  build

echo
echo "Step 3/4: Verify JS bundle is embedded"
if [[ ! -f "$JS_BUNDLE_PATH" ]]; then
  echo "Error: JS bundle not found at $JS_BUNDLE_PATH"
  exit 1
fi
echo "OK: Found $JS_BUNDLE_PATH"

echo
echo "Step 4/4: Install app on device"
npx ios-deploy -i "$DEVICE_ID" -b "$APP_PATH"

echo
echo "Done: Release build installed on device."
