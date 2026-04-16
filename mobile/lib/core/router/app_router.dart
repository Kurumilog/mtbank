import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('MTBank - Home')),
      ),
    ),
    GoRoute(
      path: '/auth',
      name: 'auth',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Auth Screen')),
      ),
    ),
  ],
);
