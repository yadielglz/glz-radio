# Glz Radio

Native Android radio streaming app for the curated Puerto Rico station list.

Glz Radio is a full native Android application. It uses Jetpack Compose and
Media3 for an expressive dark UI, background radio playback, Android Auto media
browsing, saved stations, stream recording, local weather, a sleep timer, and
signed self-updates for the friends-and-family prerelease channel.

Permissions are intentionally narrow: Internet for streams/weather and approximate location for local weather. Recordings live in app-specific storage, so broad storage access is not requested.

Playback is backed by a Media3 `MediaLibraryService` for background playback, notification controls, and Android Auto media browsing. Stations report simple stream health states and retry briefly before marking a stream offline.

The app opens with a 3-second image-only GLZ Radio splash screen.

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
