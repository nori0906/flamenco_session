#!/usr/bin/env bash
# exit on error
set -o errexit

bundle install
RAILS_ENV=production bundle exec rails assets:precompile
RAILS_ENV=production bundle exec rails assets:clean
RAILS_ENV=production bundle exec rails db:migrate
# FIXME: デプロイのたびにseedデータが作成され、バリデーションエラーになるため一時的にコメントアウト 24/2/21
# RAILS_ENV=production DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rails db:migrate:reset
# RAILS_ENV=production bundle exec rails db:seed

