<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $url = Env::get('SUPABASE_DB_URL') ?? Env::get('DATABASE_URL');
        if ($url) {
            [$dsn, $user, $password] = self::fromUrl($url);
        } else {
            $host = Env::get('SUPABASE_DB_HOST', '127.0.0.1');
            $port = Env::get('SUPABASE_DB_PORT', '5432');
            $name = Env::get('SUPABASE_DB_NAME', 'postgres');
            $user = Env::get('SUPABASE_DB_USER', 'postgres');
            $password = Env::get('SUPABASE_DB_PASSWORD', '');
            $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require', $host, $port, $name);
        }

        try {
            self::$pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            throw new \RuntimeException('Database connection failed. Set SUPABASE_DB_URL (or SUPABASE_DB_HOST/PORT/NAME/USER/PASSWORD).');
        }

        return self::$pdo;
    }

    /**
     * @return array{0:string,1:string,2:string}
     */
    private static function fromUrl(string $url): array
    {
        $parts = parse_url($url);
        if (!is_array($parts)) {
            throw new \RuntimeException('Invalid SUPABASE_DB_URL format');
        }

        $host = (string) ($parts['host'] ?? '');
        $port = (string) ($parts['port'] ?? 5432);
        $name = ltrim((string) ($parts['path'] ?? '/postgres'), '/');
        $user = (string) ($parts['user'] ?? '');
        $password = (string) ($parts['pass'] ?? '');

        if ($host === '' || $name === '' || $user === '') {
            throw new \RuntimeException('Invalid SUPABASE_DB_URL. Expected: postgres://user:password@host:5432/postgres');
        }

        $sslmode = 'require';
        if (isset($parts['query'])) {
            parse_str($parts['query'], $query);
            if (isset($query['sslmode']) && is_string($query['sslmode']) && $query['sslmode'] !== '') {
                $sslmode = $query['sslmode'];
            }
        }

        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=%s', $host, $port, $name, $sslmode);
        return [$dsn, $user, $password];
    }
}
