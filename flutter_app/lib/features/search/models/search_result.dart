class SourceItem {
  final int id;
  final String title;
  final String url;
  final String domain;
  final String? publicationDate;

  SourceItem({
    required this.id,
    required this.title,
    required this.url,
    required this.domain,
    this.publicationDate,
  });

  factory SourceItem.fromJson(Map<String, dynamic> json) {
    return SourceItem(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      domain: json['domain'] ?? '',
      publicationDate: json['publicationDate'],
    );
  }
}

class WebResultItem {
  final String id;
  final String title;
  final String url;
  final String domain;
  final String snippet;
  final String? publicationDate;

  WebResultItem({
    required this.id,
    required this.title,
    required this.url,
    required this.domain,
    required this.snippet,
    this.publicationDate,
  });

  factory WebResultItem.fromJson(Map<String, dynamic> json) {
    return WebResultItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      domain: json['domain'] ?? '',
      snippet: json['snippet'] ?? '',
      publicationDate: json['publicationDate'],
    );
  }
}

class AIAnswer {
  final String text;
  final List<String> followUps;
  final String confidence;

  AIAnswer({
    required this.text,
    required this.followUps,
    required this.confidence,
  });

  factory AIAnswer.fromJson(Map<String, dynamic> json) {
    return AIAnswer(
      text: json['text'] ?? '',
      followUps: List<String>.from(json['suggestedFollowUps'] ?? []),
      confidence: json['confidence'] ?? 'medium',
    );
  }
}

class SearchResponseData {
  final String query;
  final String normalizedQuery;
  final String language;
  final AIAnswer? answer;
  final List<WebResultItem> results;
  final List<SourceItem> sources;
  final bool cacheHit;
  final int totalResults;
  final int executionTimeMs;

  SearchResponseData({
    required this.query,
    required this.normalizedQuery,
    required this.language,
    this.answer,
    required this.results,
    required this.sources,
    required this.cacheHit,
    required this.totalResults,
    required this.executionTimeMs,
  });

  factory SearchResponseData.fromJson(Map<String, dynamic> json) {
    return SearchResponseData(
      query: json['query'] ?? '',
      normalizedQuery: json['normalizedQuery'] ?? '',
      language: json['language'] ?? 'en',
      answer: json['answer'] != null ? AIAnswer.fromJson(json['answer']) : null,
      results: (json['results'] as List? ?? [])
          .map((i) => WebResultItem.fromJson(i))
          .toList(),
      sources: (json['sources'] as List? ?? [])
          .map((i) => SourceItem.fromJson(i))
          .toList(),
      cacheHit: json['cacheHit'] ?? false,
      totalResults: json['totalResults'] ?? 0,
      executionTimeMs: json['executionTimeMs'] ?? 0,
    );
  }
}
