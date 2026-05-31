<?php

declare(strict_types=1);

use App\Core\Env;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;

ini_set('display_errors', '0');
ini_set('html_errors', '0');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e): void {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['error' => 'Server error'], JSON_UNESCAPED_SLASHES);
});

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

register_shutdown_function(function (): void {
    $err = error_get_last();
    if ($err === null) {
        return;
    }

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }

    echo json_encode(['error' => 'Server error'], JSON_UNESCAPED_SLASHES);
});

require_once __DIR__ . '/../app/Core/Env.php';

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/../app/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) {
        require_once $path;
    }
});

Env::load(__DIR__ . '/../.env');

$frontendUrl = Env::get('FRONTEND_URL', 'http://localhost:5173');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [$frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];

if ($origin !== '' && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$request = new Request();
$router = new Router();

require __DIR__ . '/../routes/api.php';

try {
    $router->dispatch($request);
} catch (Throwable $e) {
    Response::json(['error' => 'Server error'], 500);
}
