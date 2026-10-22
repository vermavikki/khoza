import 'package:flutter/material.dart';
import '../../models/search_result.dart';
import '../../../../app/theme/app_theme.dart';

class ResultsScreen extends StatefulWidget {
  final String query;
  final String mode;

  const ResultsScreen({
    super.key,
    required this.query,
    this.mode = 'all',
  });

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  late TextEditingController _controller;
  String _activeTab = 'all';

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.query);
    _activeTab = widget.mode;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: TextField(
          controller: _controller,
          decoration: InputDecoration(
            hintText: 'Search Khoza...',
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            suffixIcon: const Icon(Icons.search, size: 20),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
          ),
          onSubmitted: (val) {
            // Re-run query
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_border),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildTab('all', 'All'),
                _buildTab('ai', 'AI Answer'),
                _buildTab('news', 'News'),
                _buildTab('maps', 'Maps & Local'),
                _buildTab('images', 'Images'),
              ],
            ),
          ),
          const Divider(height: 1),

          // Results Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // AI Answer Card
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: Color(0xFFFDE68A)),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.auto_awesome, color: KhozaTheme.saffron, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Khoza AI Synthesis',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            Spacer(),
                            Icon(Icons.verified, color: KhozaTheme.indiaGreen, size: 16),
                            SizedBox(width: 4),
                            Text('Cited', style: TextStyle(fontSize: 12, color: Colors.black54)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Direct answer for "${widget.query}": Verified across official sources and public documentation [1]. Key insights confirm high compliance and nationwide availability in India [2].',
                          style: const TextStyle(fontSize: 14, height: 1.5),
                        ),
                        const SizedBox(height: 16),
                        const Divider(),
                        const Text(
                          'Verified Sources',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54),
                        ),
                        const SizedBox(height: 8),
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          dense: true,
                          leading: const CircleAvatar(
                            radius: 12,
                            child: Text('1', style: TextStyle(fontSize: 10)),
                          ),
                          title: const Text('Official Documentation & Gazette Portal', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          subtitle: const Text('gov.in · Official', style: TextStyle(fontSize: 11)),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 12),
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Web Result Item
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'wikipedia.org · Encyclopedia',
                          style: TextStyle(fontSize: 11, color: Colors.black54),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.query,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Comprehensive overview, verified background, regulatory timeline, and impact assessment for India.',
                          style: TextStyle(fontSize: 13, color: Colors.black87, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String key, String label) {
    final isSelected = _activeTab == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) {
          setState(() {
            _activeTab = key;
          });
        },
      ),
    );
  }
}
