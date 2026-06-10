#!/bin/sh
set -e

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate --force
fi

php artisan migrate --force 2>/dev/null || true
php artisan db:seed --force 2>/dev/null || true

exec "$@"
