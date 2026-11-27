# Glz Radio

**Current Android release:** `26.1127.1550`

Native Android radio streaming app and installable Web PWA for Puerto Rico live radio, synced live from GlzHub (`https://glzhub.glztech.com/api/v1/radio/stations`).

An installable browser version is available in [`web/`](web/README.md). It is
configured for deployment from GitHub to Vercel with `radio.glztech.com` as the
custom domain.

Glz Radio is a full native Android application built with Jetpack Compose and
Media3, featuring a Studio Now Playing experience with dynamic logo ambient glow,
live spectrum visualizer, tactile analog frequency dial, car-style Quick Presets
(1–6), Recently Played history (including Android Auto), inline Band & City
filtering, ICY-preserving local timeshift rewind, Wake-Up Radio Alarm with gentle
fade-in, Sleep Timer, stream health testing, scheduled DVR recording, local
weather, and signed self-updates for the friends-and-family prerelease channel.

The default visual preset is Signal Noir with an Amber accent. Playback
continues when the app is backgrounded or the screen is locked. Swiping the
task away from Android Recents stops idle sessions while preserving active
Android Auto playback.

Google Sans is bundled with the APK and applied to all Compose and platform
text styles. Signal Light provides a high-contrast daylight alternative to the
dark studio themes (available on both Android and Web).

Permissions are intentionally narrow: Internet for streams/weather and approximate location for local weather. Recordings live in app-specific storage, so broad storage access is not requested.

On Android 10 and newer, Glz Radio does not request broad storage permission:
Android does not require it for recordings created and owned by the app.
Recordings can be exported or shared from the recordings screen.

Playback is backed by a Media3 `MediaLibraryService` for background playback, notification controls, and Android Auto media browsing. Stations report live codec/bitrate telemetry, support local rewind while preserving ICY track titles, and auto-reconnect with exponential backoff.

## Build

```bash
./gradlew :app:assembleDebug
```

Open the project in Android Studio or install the debug APK from
`app/build/outputs/apk/debug/app-debug.apk`. Debug APKs are development-only and
cannot upgrade a release-signed installation.

## Friends-and-family releases

The application checks the latest GitHub Release every 12 hours and also offers
**Settings → Check for updates**. A release is offered only when its
`update.json` has a higher Android `versionCode`. The APK is downloaded over
HTTPS and its SHA-256 digest must match the release metadata before Android's
package installer is opened.

Android requires the user to approve installation and to allow Glz Radio as an
installation source. The app cannot and does not silently replace itself.

Every published APK must use the same package ID and the same release signing
key. Back up that key securely; losing it makes in-place updates impossible.
Anyone currently using a debug-signed build must uninstall it once before
installing the first permanent release-signed baseline.

### Publishing a release

1. Increase both `versionCode` and `versionName` in `app/build.gradle`.
2. Commit the release changes.
3. Create a tag matching the version name, for example `v3.2.0`.
4. Push the tag.

The `Android release` GitHub Actions workflow tests and lints the app, builds a
signed APK, verifies its certificate, creates `update.json`, and publishes both
files to GitHub Releases.

Configure these encrypted GitHub Actions secrets before publishing:

- `GLZ_RELEASE_KEYSTORE_BASE64`
- `GLZ_RELEASE_STORE_PASSWORD`
- `GLZ_RELEASE_KEY_ALIAS`
- `GLZ_RELEASE_KEY_PASSWORD`

Generate the Base64 value from the binary keystore without adding line breaks.
Never commit the keystore or `keystore.properties`; both are ignored.

## Station Catalog

The station list lives in
`app/src/main/java/com/glztech/radiostream/StationCatalog.java`.

## Recording

The player can record the selected station stream. Recordings are saved inside the app-specific Music folder under `recordings/`, so the app does not need broad storage permissions.
