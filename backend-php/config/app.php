<?php

return [
    'env' => getenv('APP_ENV') ?: 'local',
    'url' => getenv('APP_URL') ?: 'http://localhost:8000',
    'frontend_url' => getenv('FRONTEND_URL') ?: 'http://localhost:5173',
];
