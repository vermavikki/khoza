import 'package:go_router/go_router.dart';
import '../features/search/presentation/screens/home_screen.dart';
import '../features/search/presentation/screens/results_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/results',
      builder: (context, state) {
        final query = state.uri.queryParameters['q'] ?? '';
        final mode = state.uri.queryParameters['mode'] ?? 'all';
        return ResultsScreen(query: query, mode: mode);
      },
    ),
  ],
);
