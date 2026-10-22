# Khoza Android Release & Production Build Guide

This document outlines the steps to build, sign, and publish the Khoza Android application to Google Play Store or distribute it as an APK.

---

## 1. Prerequisites
- **Flutter SDK:** Version 3.24.0 or newer (Stable channel)
- **Dart SDK:** Version 3.5.0 or newer
- **Java Development Kit (JDK):** JDK 17 (OpenJDK or Corretto)
- **Android Studio:** Hedgehog | 2023.1.1 or newer
- **Android SDK Platforms:** Android 14 (API 34) and Android 13 (API 33)
- **Android Build Tools:** 34.0.0

---

## 2. Firebase Android Setup
1. In the [Firebase Console](https://console.firebase.google.com/), create a project or select an existing one.
2. Add an Android app with Package Name: `com.khoza.search`.
3. Generate the SHA-1 and SHA-256 fingerprint from your keystore:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Download `google-services.json` and place it in:
   `flutter_app/android/app/google-services.json`

---

## 3. Keystore Configuration for Release Signing

1. Generate a production upload key:
   ```bash
   keytool -genkey -v -keystore ~/khoza-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias khoza-upload
   ```

2. Create `flutter_app/android/key.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=khoza-upload
   storeFile=/path/to/khoza-upload-key.jks
   ```

---

## 4. Build Commands

### Universal Release APK
```bash
cd flutter_app
flutter clean
flutter pub get
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

### Split-per-ABI APK (Recommended for Indian Mid-Range Devices for smaller download sizes)
```bash
flutter build apk --release --split-per-abi
```
Output sizes are typically ~14MB instead of ~35MB, significantly optimizing data consumption for Indian cellular networks.

### Google Play App Bundle (AAB)
```bash
flutter build appbundle --release
```
Output: `build/app/outputs/bundle/release/app-release.aab`
