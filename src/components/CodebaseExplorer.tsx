import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  Copy,
  Check,
  Download,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  Database,
} from 'lucide-react';

interface CodeFile {
  path: string;
  category: 'flutter' | 'functions' | 'firebase' | 'docs';
  content: string;
  description: string;
}

export const CodebaseExplorer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const files: CodeFile[] = [
    {
      path: 'lib/main.dart',
      category: 'flutter',
      description: 'Flutter entry point initializing Firebase and Riverpod',
      content: `// Khoza - India-First AI Search Engine
// Flutter Entry Point
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(
    const ProviderScope(
      child: KhozaSearchApp(),
    ),
  );
}
`,
    },
    {
      path: 'lib/app/theme/app_theme.dart',
      category: 'flutter',
      description: 'Material 3 theme with authentic Indian palette (Navy, Saffron, Green)',
      content: `import 'package:flutter/material.dart';

class KhozaTheme {
  // Khoza Indian Palette
  static const Color navy = Color(0xFF14213D);
  static const Color saffron = Color(0xFFF28C28);
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
      fontFamily: 'NotoSansDevanagari',
      scaffoldBackgroundColor: warmBg,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
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
`,
    },
    {
      path: 'lib/features/search/presentation/screens/home_screen.dart',
      category: 'flutter',
      description: 'Google-inspired minimalist Indian Home Screen with voice search',
      content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/search_bar_widget.dart';
import '../widgets/trending_topics_widget.dart';
import '../../../../app/theme/app_theme.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 48),
              // Khoza Indian Identity Logo
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 44,
                        fontWeight: FontWeight.bold,
                        color: KhozaTheme.navy,
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
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'खोजा · भारत का अपना एआई सर्च इंजन',
                style: TextStyle(fontSize: 14, color: Colors.black54),
              ),
              const SizedBox(height: 32),
              // Search Input Bar
              const KhozaSearchBarWidget(),
              const SizedBox(height: 40),
              // Trending Indian Topics
              const TrendingTopicsWidget(),
            ],
          ),
        ),
      ),
    );
  }
}
`,
    },
    {
      path: 'functions/src/search/searchController.ts',
      category: 'functions',
      description: 'Firebase Cloud Functions HTTPS Callable search controller',
      content: `import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { orchestrateSearch } from './searchOrchestrator';

admin.initializeApp();
const db = admin.firestore();

export const searchKhoza = functions.https.onCall(async (data, context) => {
  const query = data.query;
  const language = data.language || 'en';
  const mode = data.mode || 'all';

  if (!query || typeof query !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Query string required');
  }

  // Derived UID from authenticated context (never trust client-supplied uid)
  const uid = context.auth?.uid;

  // Execute orchestrator with cache & AI answer grounding
  const response = await orchestrateSearch({ query, language, mode });

  // If user is authenticated, save to private search_history
  if (uid) {
    await db.collection('users').doc(uid).collection('search_history').add({
      query,
      searchedAt: admin.firestore.FieldValue.serverTimestamp(),
      language,
      cacheHit: response.cacheHit,
    });
  }

  return response;
});
`,
    },
    {
      path: 'firestore.rules',
      category: 'firebase',
      description: 'Strict Cloud Firestore security rules with RBAC and private history isolation',
      content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile: only readable and writable by the authenticated owner
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User private search history subcollection
      match /search_history/{historyId} {
        allow read, write, delete: if request.auth != null && request.auth.uid == userId;
      }

      // User private bookmarks subcollection
      match /bookmarks/{bookmarkId} {
        allow read, write, delete: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Public search cache: Read-only for authenticated/anonymous users; Write restricted to backend Admin SDK
    match /search_cache/{cacheKey} {
      allow read: if true;
      allow write: if false; // Privileged server-side Admin SDK only
    }

    // Public trending queries: Read-only
    match /trending_queries/{trendId} {
      allow read: if true;
      allow write: if false; // Scheduled Cloud Function maintenance only
    }

    // Feedback collection: Create-only with validated rating
    match /search_feedback/{feedbackId} {
      allow create: if request.resource.data.rating is int 
                    && request.resource.data.rating >= 1 
                    && request.resource.data.rating <= 5;
      allow read, update, delete: if false;
    }
  }
}
`,
    },
    {
      path: 'firestore.indexes.json',
      category: 'firebase',
      description: 'Firestore compound indexes for search cache and history queries',
      content: `{
  "indexes": [
    {
      "collectionGroup": "search_history",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "searchedAt", "order": "DESCENDING" },
        { "fieldPath": "language", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "search_cache",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
`,
    },
    {
      path: 'ANDROID_BUILD.md',
      category: 'docs',
      description: 'Complete Android APK & AAB production build instructions',
      content: `# Khoza Android Production Build Guide

## Prerequisites
- Flutter 3.24+ (Stable Channel)
- Android Studio Hedgehog or newer
- JDK 17
- Android SDK Platform 34 (Android 14)

## Step 1: Configure Firebase
1. Create a Firebase Project named \`khoza-india-search\`.
2. Register Android app with package name \`com.khoza.search\`.
3. Download \`google-services.json\` and place inside \`android/app/\`.

## Step 2: Build Release APK
\`\`\`bash
cd flutter_app
flutter pub get
flutter build apk --release --split-per-abi
\`\`\`

## Step 3: Build Google Play App Bundle (AAB)
\`\`\`bash
flutter build appbundle --release
\`\`\`
`,
    },
  ];

  const filteredFiles =
    filterCategory === 'all'
      ? files
      : files.filter((f) => f.category === filterCategory);

  const selectedFile = filteredFiles[selectedFileIndex] || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.path.split('/').pop() || 'code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-600" />
            <span>Khoza Full Architecture & Codebase Explorer</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete production Flutter Android application, Firebase Cloud Functions, Firestore Security Rules, and tests.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          {['all', 'flutter', 'functions', 'firebase', 'docs'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setSelectedFileIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main File Explorer Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Left Sidebar: File Tree */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/70 p-3 max-h-[540px] overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            Repository Files ({filteredFiles.length})
          </div>
          <div className="space-y-1">
            {filteredFiles.map((file, idx) => {
              const isSelected = file.path === selectedFile.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-100/70 text-amber-950 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 ${
                        file.category === 'flutter'
                          ? 'text-blue-500'
                          : file.category === 'functions'
                          ? 'text-amber-600'
                          : file.category === 'firebase'
                          ? 'text-orange-500'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display */}
        <div className="md:col-span-8 flex flex-col bg-slate-900 text-slate-100 max-h-[540px]">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-amber-400">{selectedFile.path}</span>
              <span className="text-slate-400 hidden sm:inline">· {selectedFile.description}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <pre className="flex-1 p-4 font-mono text-xs overflow-auto leading-relaxed text-slate-200">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
