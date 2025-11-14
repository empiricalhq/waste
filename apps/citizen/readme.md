# Docs

Before you start, you're going to need a Google Cloud API key. To get it, just follow the
[official guide](https://docs.expo.dev/versions/latest/sdk/maps/#google-cloud-api-setup)
from Expo (you'll basically enable "Maps SDK for Android" and will get a key). Paste that
key in `app.json` under `android.config.googleMaps.apiKey` (don't commit this!).

> [!NOTE]
> Expo Go cannot load `expo-maps` or `react-native-fast-squircle` as they have
> native code; you must use a custom development build. To build this, you'll need EAS
> CLI: `bun i -g eas-cli` (this is done automatically after `bun install`, see the
> postinstall script)

## Builds

### Development builds (cloud)

Fastest way to run the project on a real device.

1. `bun run dev`
   - Bundles the project (~600 MB) and uploads it to EAS.
   - 3–5 min upload time; build queue + compile take about 20 min when the queue is short.

2. Download the generated APK from the EAS dashboard and install it.
   - The binary includes every native dependency; hot-reload works like Expo Go.

### Local builds (Android only)

Use when you want to compile on your own machine.

1. Install Android Studio and the Android SDK.
2. Set `ANDROID_HOME`. For Windows PowerShell (temporary):

   ```powershell
   $env:ANDROID_HOME = "C:\Users\<user>\AppData\Local\Android\Sdk"
   ```

   Permanent:
   - Admin: System Properties > Environment Variables.
   - Non-admin: Control Panel > User Accounts > Change my environment variables.

   Then add `%ANDROID_HOME%\platform-tools` to `PATH`.

3. Restart your terminal / IDE (VS Code may need a full restart).
