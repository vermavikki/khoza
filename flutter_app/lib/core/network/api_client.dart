import 'package:dio/dio.dart';
import '../config/app_config.dart';

class ApiClient {
  final Dio dio;

  ApiClient({Dio? client})
      : dio = client ??
            Dio(
              BaseOptions(
                baseUrl: AppConfig.cloudFunctionsBaseUrl,
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 20),
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': 'KhozaAndroidClient/1.0',
                },
              ),
            );

  Future<Response> search({
    required String query,
    String language = 'en',
    String mode = 'all',
    bool forceFresh = false,
  }) async {
    return await dio.post(
      '/searchKhoza',
      data: {
        'query': query,
        'language': language,
        'mode': mode,
        'forceFresh': forceFresh,
      },
    );
  }
}
