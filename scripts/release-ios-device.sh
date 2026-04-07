#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "app.json" ]]; then
  echo "Error: app.json not found. Run this script from the repository."
  exit 1
fi

BUNDLE_IDENTIFIER="$(node -e "const app=require('./app.json');process.stdout.write(app?.expo?.ios?.bundleIdentifier ?? '');")"
ENTITLEMENTS_PATH="ios/Momentum/Momentum.entitlements"
PODFILE_LOCK_PATH="ios/Podfile.lock"

ensure_required_expo_pods() {
  if [[ ! -f "$PODFILE_LOCK_PATH" ]]; then
    echo "Error: $PODFILE_LOCK_PATH not found after pod install."
    exit 1
  fi

  local missing_pods=()

  # Task manager pod naming differs across Expo SDK generations.
  if ! rg -q "^  - (ExpoTaskManager|EXTaskManager) " "$PODFILE_LOCK_PATH"; then
    missing_pods+=("TaskManager(ExpoTaskManager|EXTaskManager)")
  fi

  # Notifications pod naming differs across Expo SDK generations.
  if ! rg -q "^  - (ExpoNotifications|EXNotifications) " "$PODFILE_LOCK_PATH"; then
    missing_pods+=("Notifications(ExpoNotifications|EXNotifications)")
  fi

  if ! rg -q "^  - ExpoBackgroundTask " "$PODFILE_LOCK_PATH"; then
    missing_pods+=("ExpoBackgroundTask")
  fi

  if [[ ${#missing_pods[@]} -gt 0 ]]; then
    echo "Error: Missing required iOS pods: ${missing_pods[*]}"
    echo "This can cause startup crashes like: Cannot find native module 'ExpoTaskManager'."
    echo "Run '(cd ios && pod install)' and retry."
    exit 1
  fi
}

disable_user_script_sandboxing() {
  local project_path="ios/Momentum.xcodeproj/project.pbxproj"

  if [[ ! -f "$project_path" ]]; then
    echo "Warning: $project_path not found. Skipping ENABLE_USER_SCRIPT_SANDBOXING patch."
    return
  fi

  if grep -q "ENABLE_USER_SCRIPT_SANDBOXING = YES;" "$project_path"; then
    perl -0pi -e 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' "$project_path"
    echo "Patched ENABLE_USER_SCRIPT_SANDBOXING=NO in $project_path"
  else
    echo "ENABLE_USER_SCRIPT_SANDBOXING already set to NO in $project_path"
  fi
}

strip_push_entitlement_for_personal_team() {
  if [[ ! -f "$ENTITLEMENTS_PATH" ]]; then
    echo "No entitlements file found at $ENTITLEMENTS_PATH. Skipping push entitlement patch."
    return
  fi

  if /usr/libexec/PlistBuddy -c "Print :aps-environment" "$ENTITLEMENTS_PATH" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Delete :aps-environment" "$ENTITLEMENTS_PATH"
    echo "Removed aps-environment entitlement from $ENTITLEMENTS_PATH for personal-team signing compatibility."
  else
    echo "No aps-environment entitlement present in $ENTITLEMENTS_PATH."
  fi
}

build_release() {
  local build_log="$1"

  xcodebuild \
    -workspace "$WORKSPACE_PATH" \
    -scheme "$SCHEME_NAME" \
    -configuration Release \
    -destination "id=$DEVICE_ID" \
    -derivedDataPath "$DERIVED_DATA_PATH" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    build | tee "$build_log"
}

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

print_usage() {
  cat <<'EOF'
Usage: ./scripts/release-ios-device.sh [device_id team_id] [options]

Options:
  -d, --device-id <id>  iPhone UDID
  -t, --team-id <id>    Apple Developer Team ID
  -h, --help            Show this help message

Examples:
  ./scripts/release-ios-device.sh
  ./scripts/release-ios-device.sh <device_id> <team_id>
  ./scripts/release-ios-device.sh --device-id <device_id> --team-id <team_id>
EOF
}

DEVICE_ID=""
TEAM_ID=""
POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--device-id)
      if [[ -z "${2:-}" ]]; then
        echo "Error: Missing value for $1"
        print_usage
        exit 1
      fi
      DEVICE_ID="$2"
      shift 2
      ;;
    -t|--team-id)
      if [[ -z "${2:-}" ]]; then
        echo "Error: Missing value for $1"
        print_usage
        exit 1
      fi
      TEAM_ID="$2"
      shift 2
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    -*)
      echo "Error: Unknown option $1"
      print_usage
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ -z "$DEVICE_ID" && ${#POSITIONAL_ARGS[@]} -ge 1 ]]; then
  DEVICE_ID="${POSITIONAL_ARGS[0]}"
fi

if [[ -z "$TEAM_ID" && ${#POSITIONAL_ARGS[@]} -ge 2 ]]; then
  TEAM_ID="${POSITIONAL_ARGS[1]}"
fi

if [[ ${#POSITIONAL_ARGS[@]} -gt 2 ]]; then
  echo "Error: Too many positional arguments."
  print_usage
  exit 1
fi

if [[ -z "$DEVICE_ID" ]]; then
  DEVICE_ID="$(prompt_required "Enter device_id (iPhone UDID)")"
fi

if [[ -z "$TEAM_ID" ]]; then
  TEAM_ID="$(prompt_required "Enter team_id (Apple Developer Team ID)")"
fi

PREBUILD_BUNDLE_DIR="ios/build/prebundle"
PREBUILD_BUNDLE_PATH="$PREBUILD_BUNDLE_DIR/main.jsbundle"

echo "Step 1/7: Regenerate iOS native project"
npx expo prebuild --platform ios

echo "Step 2/7: Install iOS pods"
(cd ios && pod install)
ensure_required_expo_pods

echo "Step 3/7: Generate production JS bundle from Expo CLI"
rm -rf "$PREBUILD_BUNDLE_DIR"
mkdir -p "$PREBUILD_BUNDLE_DIR"
npx expo export:embed \
  --platform ios \
  --dev false \
  --bundle-output "$PREBUILD_BUNDLE_PATH" \
  --assets-dest "$PREBUILD_BUNDLE_DIR"

if [[ ! -f "$PREBUILD_BUNDLE_PATH" ]]; then
  echo "Error: Prebuild JS bundle not found at $PREBUILD_BUNDLE_PATH"
  exit 1
fi
echo "OK: Created $PREBUILD_BUNDLE_PATH"

echo "Step 4/7: Ensure Xcode script sandboxing is disabled for RN bundle phase"
disable_user_script_sandboxing

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
echo "Step 5/7: Build Release for device"
BUILD_LOG_PATH="$(mktemp -t momentum-release-build.XXXXXX.log)"

if ! build_release "$BUILD_LOG_PATH"; then
  if rg -q "do not support the Push Notifications capability|doesn't include the Push Notifications capability|doesn't include the aps-environment entitlement" "$BUILD_LOG_PATH"; then
    echo
    echo "Detected push-notification signing incompatibility for the selected team."
    echo "Retrying build after removing aps-environment entitlement."
    strip_push_entitlement_for_personal_team
    build_release "$BUILD_LOG_PATH"
  else
    echo
    echo "Build failed. See log: $BUILD_LOG_PATH"
    exit 1
  fi
fi

echo
echo "Step 6/7: Verify JS bundle is embedded"
if [[ ! -f "$JS_BUNDLE_PATH" ]]; then
  echo "Error: JS bundle not found at $JS_BUNDLE_PATH"
  exit 1
fi
echo "OK: Found $JS_BUNDLE_PATH"

echo
echo "Step 7/7: Install app on device"
npx ios-deploy -i "$DEVICE_ID" -b "$APP_PATH"

echo
echo "Done: Release build installed on device."
