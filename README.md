# Glz Radio

Native Android radio streaming app for the curated Puerto Rico station list.

Glz Radio uses Jetpack Compose with Material 3 alpha libraries for an expressive dark UI: a visual header banner, teal accents, a compact search action, a simplified station browser, a bottom player bar that expands into full player details, saved stations, in-app recording review/playback, and a menu for settings/weather/about actions.

Permissions are intentionally narrow: Internet for streams/weather and approximate location for local weather. Recordings live in app-specific storage, so broad storage access is not requested.

Playback is backed by a Media3 `MediaLibraryService` for background playback, notification controls, and Android Auto media browsing. Stations report simple stream health states and retry briefly before marking a stream offline.

The app opens with a 3-second image-only GLZ Radio splash screen.

## Build

```bash
./gradlew :app:assembleDebug
```

Open the project in Android Studio or install the debug APK from `app/build/outputs/apk/debug/app-debug.apk`.

## Station Catalog

The station list lives in `app/src/main/java/com/yadielglz/radiostreamer/StationCatalog.java`.

## Recording

The player can record the selected station stream. Recordings are saved inside the app-specific Music folder under `recordings/`, so the app does not need broad storage permissions.
