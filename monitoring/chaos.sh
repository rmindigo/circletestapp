#!/bin/sh
# Usage: ./chaos.sh <error rate 0-1>   e.g. ./chaos.sh 0.5 to fail half of API requests, ./chaos.sh 0 to stop
set -e
rate="${1:?usage: ./chaos.sh <error rate between 0 and 1>}"
curl -fsS -X POST http://localhost:3000/admin/fault \
  -H 'Content-Type: application/json' \
  -d "{\"errorRate\": $rate}"
echo
