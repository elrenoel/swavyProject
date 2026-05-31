<?php

declare(strict_types=1);

namespace App\Core;

use Closure;

final class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler, array $middlewares = []): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares,
        ];
    }

    public function dispatch(Request $request): void
    {
        $requestMethod = $request->method();
        $requestPath = rtrim($request->path(), '/') ?: '/';

        foreach ($this->routes as $route) {
            if ($route['method'] !== $requestMethod) {
                continue;
            }

            $pattern = preg_replace('#:([a-zA-Z_][a-zA-Z0-9_]*)#', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . rtrim((string) $pattern, '/') . '$#';
            if ($pattern === '#^$#') {
                $pattern = '#^/$#';
            }

            if (!preg_match($pattern, $requestPath, $matches)) {
                continue;
            }

            foreach ($matches as $key => $value) {
                if (!is_int($key)) {
                    $request->params[$key] = $value;
                }
            }

            $runner = array_reduce(
                array_reverse($route['middlewares']),
                fn (Closure $next, callable $mw): Closure => fn () => $mw($request, $next),
                fn () => ($route['handler'])($request)
            );

            $runner();
            return;
        }

        Response::json(['error' => 'Not Found'], 404);
    }
}
