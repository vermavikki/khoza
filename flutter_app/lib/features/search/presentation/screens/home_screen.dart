import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  void _onSearchSubmitted(String query) {
    if (query.trim().isNotEmpty) {
      context.push('/results?q=${Uri.encodeComponent(query.trim())}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: KhozaTheme.navy),
            onPressed: () {},
            tooltip: 'Language Toggle',
          ),
          IconButton(
            icon: const Icon(Icons.bookmark_border, color: KhozaTheme.navy),
            onPressed: () {},
            tooltip: 'Bookmarks',
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              // Khoza Indian Identity Logo
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: KhozaTheme.navy,
                    letterSpacing: -1,
                  ),
                  children: [
                    TextSpan(text: 'Kho'),
                    TextSpan(
                      text: 'z',
                      style: TextStyle(color: KhozaTheme.saffron),
                    ),
                    TextSpan(
                      text: 'a',
                      style: TextStyle(color: KhozaTheme.indiaGreen),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'खोजा · भारत का अपना एआई सर्च इंजन',
                style: TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 36),

              // Search Bar
              TextField(
                controller: _searchController,
                textInputAction: TextInputAction.search,
                onSubmitted: _onSearchSubmitted,
                decoration: InputDecoration(
                  hintText: 'Search with Khoza AI...',
                  prefixIcon: const Icon(Icons.search, color: Colors.black45),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.mic, color: KhozaTheme.saffron),
                    onPressed: () {},
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  FilledButton.tonal(
                    onPressed: () => _onSearchSubmitted(_searchController.text),
                    child: const Text('Khoza Search'),
                  ),
                  const SizedBox(width: 12),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: KhozaTheme.saffron,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => _onSearchSubmitted(_searchController.text.isNotEmpty ? _searchController.text : 'Chandrayaan 3 mission'),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome, size: 16),
                        SizedBox(width: 6),
                        Text('AI Cited Answer'),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),

              // Trending Section Header
              const Row(
                children: [
                  Icon(Icons.trending_up, size: 20, color: KhozaTheme.saffron),
                  SizedBox(width: 8),
                  Text(
                    'TRENDING IN INDIA',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black45, letterSpacing: 0.5),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Trending Queries
              ...[
                'IPL 2026 Match Schedule & Teams',
                'Chandrayaan 4 Mission Updates',
                'UPI 123Pay Offline Payment Rules',
                'Top AI Startups in Bengaluru',
              ].map(
                (trend) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.search, size: 18, color: Colors.black38),
                  title: Text(trend, style: const TextStyle(fontSize: 14)),
                  trailing: const Icon(Icons.arrow_outward, size: 16, color: Colors.black26),
                  onTap: () => _onSearchSubmitted(trend),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
