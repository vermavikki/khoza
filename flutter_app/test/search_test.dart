import 'package:flutter_test/flutter_test.dart';
import 'package:khoza_search/features/search/models/search_result.dart';

void main() {
  group('Khoza Search Models Test', () {
    test('SearchResponseData parses valid json correctly', () {
      final json = {
        'query': 'UPI limits in India',
        'normalizedQuery': 'upi limits in india',
        'language': 'en',
        'cacheHit': true,
        'totalResults': 1,
        'executionTimeMs': 24,
        'answer': {
          'text': 'UPI standard transaction limit is ₹1 Lakh per day [1].',
          'suggestedFollowUps': ['Can I increase UPI limit?'],
          'confidence': 'high',
        },
        'results': [
          {
            'id': 'res-1',
            'title': 'National Payments Corporation of India',
            'url': 'https://npci.org.in',
            'domain': 'npci.org.in',
            'snippet': 'Official portal of UPI guidelines.',
          }
        ],
        'sources': [
          {
            'id': 1,
            'title': 'NPCI Official',
            'url': 'https://npci.org.in',
            'domain': 'npci.org.in',
          }
        ],
      };

      final response = SearchResponseData.fromJson(json);

      expect(response.query, 'UPI limits in India');
      expect(response.cacheHit, true);
      expect(response.results.length, 1);
      expect(response.sources.length, 1);
      expect(response.answer?.text.contains('[1]'), true);
      expect(response.answer?.confidence, 'high');
    });
  });
}
