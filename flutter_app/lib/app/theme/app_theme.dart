import 'package:flutter/material.dart';

class KhozaTheme {
  // Khoza Indian Palette
  static const Color navy = Color(0xFF14213D);
  static const Color saffron = Color(0xFFF28C28);
  static const Color saffronDark = Color(0xFFD97706);
  static const Color indiaGreen = Color(0xFF16845B);
  static const Color warmBg = Color(0xFFFDFBF7);
  static const Color neutralText = Color(0xFF252A34);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: saffron,
        primary: navy,
        secondary: saffron,
        tertiary: indiaGreen,
        surface: warmBg,
      ),
      scaffoldBackgroundColor: warmBg,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(28.0),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(28.0),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(28.0),
          borderSide: const BorderSide(color: saffron, width: 2.0),
        ),
      ),
    );
  }
}
