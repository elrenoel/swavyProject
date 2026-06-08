<?php

declare(strict_types=1);

namespace App\Services;

use PDO;

final class ReviewService
{
    private const SELECT = 'id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at';

    public static function create(PDO $pdo, array $payload): array
    {
        $sql = 'INSERT INTO reviews (user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content) VALUES (:user_id,:username,:track_id,:album_id,:album_name,:album_type,:title,:artist,:image_url,:rating,:content) RETURNING ' . self::SELECT;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($payload);
        return $stmt->fetch() ?: [];
    }

    public static function update(PDO $pdo, string $id, string $userId, int $rating, ?string $content): ?array
    {
        $sql = 'UPDATE reviews SET rating=:rating, content=:content, updated_at=NOW() WHERE id=:id AND user_id=:uid RETURNING ' . self::SELECT;
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['rating' => $rating, 'content' => $content, 'id' => $id, 'uid' => $userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getMyTrackReview(PDO $pdo, string $trackId, string $userId): ?array
    {
        $stmt = $pdo->prepare('SELECT ' . self::SELECT . ' FROM reviews WHERE track_id=:track AND user_id=:uid LIMIT 1');
        $stmt->execute(['track' => $trackId, 'uid' => $userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getRecent(PDO $pdo, int $limit, int $offset, ?string $viewerId): array
    {
        $stmt = $pdo->prepare('SELECT ' . self::SELECT . ' FROM reviews ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $count = (int) $pdo->query('SELECT COUNT(*) FROM reviews')->fetchColumn();
        return [
            'reviews' => self::attachLiked($pdo, self::attachCurrentUsernames($pdo, $rows), $viewerId),
            'total' => $count,
        ];
    }

    public static function getTrack(PDO $pdo, string $trackId, ?string $viewerId): array
    {
        $stmt = $pdo->prepare('SELECT ' . self::SELECT . ' FROM reviews WHERE track_id=:track ORDER BY likes_count DESC, created_at DESC');
        $stmt->execute(['track' => $trackId]);
        $rows = $stmt->fetchAll();
        return ['reviews' => self::attachLiked($pdo, self::attachCurrentUsernames($pdo, $rows), $viewerId)];
    }

    public static function getPopular(PDO $pdo, int $limit, string $since): array
    {
        $stmt = $pdo->prepare('SELECT ' . self::SELECT . ' FROM reviews WHERE created_at >= :since ORDER BY likes_count DESC, created_at DESC LIMIT :limit');
        $stmt->bindValue(':since', $since);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return ['reviews' => self::attachCurrentUsernames($pdo, $stmt->fetchAll())];
    }

    public static function toggleLike(PDO $pdo, string $reviewId, string $userId): ?array
    {
        $stmt = $pdo->prepare('SELECT id, likes_count FROM reviews WHERE id=:id LIMIT 1');
        $stmt->execute(['id' => $reviewId]);
        $review = $stmt->fetch();
        if (!$review) return null;

        $check = $pdo->prepare('SELECT id FROM review_likes WHERE review_id=:rid AND user_id=:uid LIMIT 1');
        $check->execute(['rid' => $reviewId, 'uid' => $userId]);
        $liked = (bool) $check->fetch();

        $likes = (int) ($review['likes_count'] ?? 0);
        if ($liked) {
            $del = $pdo->prepare('DELETE FROM review_likes WHERE review_id=:rid AND user_id=:uid');
            $del->execute(['rid' => $reviewId, 'uid' => $userId]);
            $likes = max(0, $likes - 1);
            $liked = false;
        } else {
            $ins = $pdo->prepare('INSERT INTO review_likes (review_id, user_id) VALUES (:rid,:uid) ON CONFLICT DO NOTHING');
            $ins->execute(['rid' => $reviewId, 'uid' => $userId]);
            $liked = true;
            if ($ins->rowCount() > 0) {
                $likes += 1;
            }
        }

        $upd = $pdo->prepare('UPDATE reviews SET likes_count=:likes WHERE id=:id');
        $upd->execute(['likes' => $likes, 'id' => $reviewId]);

        return ['liked' => $liked, 'likes_count' => $likes];
    }

    private static function attachLiked(PDO $pdo, array $rows, ?string $viewerId): array
    {
        if (!$viewerId || !$rows) {
            return array_map(fn ($r) => [...$r, 'liked_by_me' => false], $rows);
        }

        $ids = array_column($rows, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = 'SELECT review_id FROM review_likes WHERE user_id = ? AND review_id IN (' . $placeholders . ')';
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_merge([$viewerId], $ids));
        $likedIds = array_column($stmt->fetchAll(), 'review_id');
        $set = array_flip($likedIds);

        return array_map(fn ($r) => [...$r, 'liked_by_me' => isset($set[$r['id']])], $rows);
    }

    private static function attachCurrentUsernames(PDO $pdo, array $rows): array
    {
        if (!$rows) return [];

        $userIds = array_values(array_unique(array_filter(array_column($rows, 'user_id'))));
        if (!$userIds) return $rows;

        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $stmt = $pdo->prepare('SELECT id, username FROM profiles WHERE id IN (' . $placeholders . ')');
        $stmt->execute($userIds);

        $usernameByUserId = [];
        foreach ($stmt->fetchAll() as $profile) {
            $usernameByUserId[$profile['id']] = $profile['username'];
        }

        return array_map(function ($row) use ($usernameByUserId) {
            if (isset($usernameByUserId[$row['user_id']])) {
                $row['username'] = $usernameByUserId[$row['user_id']];
            }

            return $row;
        }, $rows);
    }
}
