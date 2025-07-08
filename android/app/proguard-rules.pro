# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep network-related classes for API calls
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }
-dontwarn okhttp3.**
-dontwarn retrofit2.**

# Keep React Native networking
-keep class com.facebook.react.modules.network.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Keep fetch API related classes
-keep class com.facebook.react.modules.fetch.** { *; }

# Keep JSON parsing classes
-keep class com.google.gson.** { *; }
-keep class org.json.** { *; }

# Keep all classes that might be used for networking
-keep class java.net.** { *; }
-keep class javax.net.** { *; }
-keep class android.net.** { *; }
