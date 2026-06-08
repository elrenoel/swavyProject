<?php

declare(strict_types=1);

namespace App\Services;

use PDO;

final class ProfileService
{
    public static function getById(PDO $pdo, string $userId): ?array
    {
        $stmt = $pdo->prepare('SELECT id, username, full_name, avatar_url, updated_at FROM profiles WHERE id=:id LIMIT 1');
        $stmt->execute(['id' => $userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getByUsername(PDO $pdo, string $username): ?array
    {
        $stmt = $pdo->prepare('SELECT id, username, full_name, avatar_url, updated_at FROM profiles WHERE username=:u LIMIT 1');
        $stmt->execute(['u' => $username]);
        $row = $stmt->fetch();
        if ($row) return $row;

        if (!self::isUuid($username)) return null;
        return self::getById($pdo, $username);
    }

    public static function update(PDO $pdo, string $userId, ?string $username, mixed $fullNameProvided, ?string $fullName, ?string $avatarUrl = null): ?array
    {
        $fields = ['updated_at = NOW()'];
        $params = ['id' => $userId];
        if ($username !== null) {
            $fields[] = 'username = :username';
            $params['username'] = $username;
        }
        if ($fullNameProvided) {
            $fields[] = 'full_name = :full_name';
            $params['full_name'] = $fullName;
        }
        if ($avatarUrl !== null) {
            $fields[] = 'avatar_url = :avatar';
            $params['avatar'] = $avatarUrl;
        }
        $sql = 'UPDATE profiles SET ' . implode(', ', $fields) . ' WHERE id=:id RETURNING id, username, full_name, avatar_url, updated_at';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function stats(PDO $pdo, string $userId): array
    {
        $reviews = (int) self::count($pdo, 'SELECT COUNT(*) FROM reviews WHERE user_id=:id', $userId);
        $lists = (int) self::count($pdo, 'SELECT COUNT(*) FROM lists WHERE user_id=:id', $userId);
        $followers = (int) self::count($pdo, 'SELECT COUNT(*) FROM follows WHERE following_id=:id', $userId);

        $songStmt = $pdo->prepare('SELECT COUNT(*) FROM list_songs WHERE list_id IN (SELECT id FROM lists WHERE user_id=:id)');
        $songStmt->execute(['id' => $userId]);
        $listSongs = (int) $songStmt->fetchColumn();

        return [
            'reviewsCount' => $reviews,
            'followersCount' => $followers,
            'listsCount' => $lists,
            'listSongsCount' => $listSongs,
        ];
    }

    public static function topPicks(PDO $pdo, string $userId, int $limit): array
    {
        $stmt = $pdo->prepare('SELECT id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at FROM reviews WHERE user_id=:uid ORDER BY likes_count DESC, created_at DESC LIMIT :limit');
        $stmt->bindValue(':uid', $userId);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function lists(PDO $pdo, string $userId, int $limit, int $offset): array
    {
        $stmt = $pdo->prepare('SELECT id, user_id, title, description, created_at FROM lists WHERE user_id=:uid ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':uid', $userId);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM lists WHERE user_id=:uid');
        $totalStmt->execute(['uid' => $userId]);
        $total = (int) $totalStmt->fetchColumn();

        $lists = array_map(function ($row) use ($pdo) {
            $songs = $pdo->prepare('SELECT song_id, title, artist, image, created_at FROM list_songs WHERE list_id=:id ORDER BY created_at ASC');
            $songs->execute(['id' => $row['id']]);
            $songRows = $songs->fetchAll();
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'desc' => $row['description'],
                'created_at' => $row['created_at'],
                'songs' => array_map(fn ($s) => [
                    'id' => $s['song_id'],
                    'title' => $s['title'],
                    'artist' => $s['artist'],
                    'image' => $s['image'],
                    'created_at' => $s['created_at'],
                ], $songRows),
            ];
        }, $rows);

        return ['lists' => $lists, 'total' => $total];
    }

    public static function isFollowing(PDO $pdo, string $followerId, string $followingId): bool
    {
        $stmt = $pdo->prepare('SELECT id FROM follows WHERE follower_id=:follower AND following_id=:following LIMIT 1');
        $stmt->execute(['follower' => $followerId, 'following' => $followingId]);
        return (bool) $stmt->fetch();
    }

    public static function follow(PDO $pdo, string $followerId, string $followingId): void
    {
        $stmt = $pdo->prepare('INSERT INTO follows (follower_id, following_id) VALUES (:follower, :following) ON CONFLICT DO NOTHING');
        $stmt->execute(['follower' => $followerId, 'following' => $followingId]);
    }

    public static function unfollow(PDO $pdo, string $followerId, string $followingId): void
    {
        $stmt = $pdo->prepare('DELETE FROM follows WHERE follower_id=:follower AND following_id=:following');
        $stmt->execute(['follower' => $followerId, 'following' => $followingId]);
    }

    private static function count(PDO $pdo, string $sql, string $id): int
    {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return (int) $stmt->fetchColumn();
    }

    private static function isUuid(string $value): bool
    {
        return (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value);
    }
}
