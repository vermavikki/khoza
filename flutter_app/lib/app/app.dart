import 'package:flutter/material.dart';
import 'router.dart';
import 'theme/app_theme.dart';

class KhozaSearchApp extends StatelessWidget {
  const KhozaSearchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Khoza Search',
      debugShowCheckedModeBanner: false,
      theme: KhozaTheme.lightTheme,
      routerConfig: appRouter,
    );
  }
}
