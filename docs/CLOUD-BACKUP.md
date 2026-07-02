# Облачные бэкапы прод-БД

Ежесуточно в 04:00 Алматы workflow [.github/workflows/db-backup.yml](../.github/workflows/db-backup.yml)
снимает `pg_dump` с прод-Postgres (Railway), шифрует AES-256 и кладёт в артефакты
GitHub Actions (ретенция 30 дней). Репозиторий публичный — незашифрованный дамп
туда класть НЕЛЬЗЯ.

## Включение (один раз, ~2 минуты)

GitHub → репозиторий → Settings → Secrets and variables → Actions → New repository secret:

1. `PROD_DATABASE_URL` — строка подключения из Railway (Postgres → Connect →
   Public URL, начинается с `postgresql://...rlwy.net...`).
2. `BACKUP_PASSPHRASE` — придумать длинную фразу (сохранить в менеджере паролей!
   без неё бэкапы не расшифровать).

Проверка: Actions → DB Backup → Run workflow → дождаться зелёного → в артефактах
появится `studyhub-db-<id>`.

## Восстановление

```bash
# 1. Скачать артефакт из Actions (studyhub-db-<run_id>) и распаковать zip
# 2. Расшифровать:
openssl enc -d -aes-256-cbc -pbkdf2 -in backup.dump.enc -out backup.dump -pass pass:<BACKUP_PASSPHRASE>
# 3. Восстановить (в пустую БД или с --clean на существующую):
pg_restore --no-owner --clean --if-exists -d "$DATABASE_URL" backup.dump
```

## Связанное

- Локальный сценарий бэкапа/восстановления: [BACKUP-RESTORE.md](BACKUP-RESTORE.md)
- Миграции: с 2026-07-02 прод обновляется через `prisma migrate deploy`
  (baseline `0_init` помечен applied). Новые изменения схемы: `npm run db:migrate`
  локально → закоммитить `prisma/migrations/` → деплой применит сам.
  **`db push --accept-data-loss` на прод больше не используется.**
