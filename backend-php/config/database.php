<?php

return [
    'host' => getenv('SUPABASE_DB_HOST') ?: '127.0.0.1',
    'port' => getenv('SUPABASE_DB_PORT') ?: '5432',
    'name' => getenv('SUPABASE_DB_NAME') ?: 'postgres',
    'user' => getenv('SUPABASE_DB_USER') ?: 'postgres',
    'password' => getenv('SUPABASE_DB_PASSWORD') ?: '',
];
