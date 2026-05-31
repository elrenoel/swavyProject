<?php

declare(strict_types=1);

namespace App\Services;

use PDO;

final class ListService
{
    public static function getLists(PDO $pdo, string $userId): array
    {
        $stmt = $pdo->prepare('SELECT id, user_id, title, description, created_at FROM lists WHERE user_id = :uid ORDER BY created_at DESC');
        $stmt->execute(['uid' => $userId]);
        $lists = $stmt->fetchAll();

        return array_map(fn ($row) => self::mapList($pdo, $row), $lists);
    }

    public static function getListById(PDO $pdo, string $id): ?array
    {
        $stmt = $pdo->prepare('SELECT id, user_id, title, description, created_at FROM lists WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ? self::mapList($pdo, $row) : null;
    }

    public static function createList(PDO $pdo, string $userId, string $title, ?string $desc): array
    {
        $stmt = $pdo->prepare('INSERT INTO lists (user_id, title, description) VALUES (:uid, :title, :desc) RETURNING id, user_id, title, description, created_at');
        $stmt->execute(['uid' => $userId, 'title' => $title, 'desc' => $desc]);
        $row = $stmt->fetch();
        $mapped = self::mapList($pdo, $row ?: []);
        $mapped['songs'] = [];
        return $mapped;
    }

    public static function updateList(PDO $pdo, string $id, string $userId, ?string $title, mixed $descProvided, ?string $desc): ?array
    {
        $fields = [];
        $params = ['id' => $id, 'uid' => $userId];

        if ($title !== null) {
            $fields[] = 'title = :title';
            $params['title'] = $title;
        }
        if ($descProvided) {
            $fields[] = 'description = :desc';
            $params['desc'] = $desc;
        }
        if (!$fields) {
            return null;
        }

        $sql = 'UPDATE lists SET ' . implode(', ', $fields) . ' WHERE id = :id AND user_id = :uid RETURNING id, user_id, title, description, created_at';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        if (!$row) return null;
        $mapped = self::mapList($pdo, $row);
        $mapped['songs'] = [];
        return $mapped;
    }

    public static function deleteList(PDO $pdo, string $id, string $userId): bool
    {
        $stmt = $pdo->prepare('DELETE FROM lists WHERE id = :id AND user_id = :uid');
        $stmt->execute(['id' => $id, 'uid' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public static function addSong(PDO $pdo, string $listId, string $songId, string $title, ?string $artist, ?string $image): array
    {
        $stmt = $pdo->prepare('INSERT INTO list_songs (list_id, song_id, title, artist, image) VALUES (:list_id, :song_id, :title, :artist, :image) RETURNING song_id, title, artist, image, created_at');
        $stmt->execute([
            'list_id' => $listId,
            'song_id' => $songId,
            'title' => $title,
            'artist' => $artist,
            'image' => $image,
        ]);
        $row = $stmt->fetch();

        return [
            'id' => $row['song_id'],
            'title' => $row['title'],
            'artist' => $row['artist'],
            'image' => $row['image'],
            'created_at' => $row['created_at'],
        ];
    }

    public static function removeSong(PDO $pdo, string $listId, string $songId): bool
    {
        $stmt = $pdo->prepare('DELETE FROM list_songs WHERE list_id = :list_id AND song_id = :song_id');
        $stmt->execute(['list_id' => $listId, 'song_id' => $songId]);
        return $stmt->rowCount() > 0;
    }

    private static function mapList(PDO $pdo, array $row): array
    {
        $stmt = $pdo->prepare('SELECT song_id, title, artist, image, created_at FROM list_songs WHERE list_id = :id ORDER BY created_at ASC');
        $stmt->execute(['id' => $row['id']]);
        $songs = $stmt->fetchAll();

        return [
            'id' => $row['id'],
            'user_id' => $row['user_id'],
            'title' => $row['title'],
            'desc' => $row['description'],
            'created_at' => $row['created_at'],
            'songs' => array_map(fn ($s) => [
                'id' => $s['song_id'],
                'title' => $s['title'],
                'artist' => $s['artist'],
                'image' => $s['image'],
                'created_at' => $s['created_at'],
            ], $songs),
        ];
    }
}
