<?php

declare(strict_types=1);

namespace App\Core;

use JsonException;

final class Request
{
    public array $params = [];
    public mixed $user = null;
    public ?string $accessToken = null;

    public function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public function path(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH);
        return $path === null ? '/' : $path;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$key] ?? null;
    }

    public function cookie(string $name): ?string
    {
        return $_COOKIE[$name] ?? null;
    }

    public function json(): array
    {
        $raw = file_get_contents('php://input');
        if (!$raw) {
            return [];
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            return is_array($decoded) ? $decoded : [];
        } catch (JsonException) {
            return [];
        }
    }
}
