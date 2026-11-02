#!/bin/bash
# 사용법: lost-home/src 에서 ./build.sh  → ../index.html 생성
# 필요: python 3 + fonttools (pip install fonttools brotli)
set -e
cd "$(dirname "$0")"
for py in python3 python; do
  if "$py" -c 'import fontTools' 2>/dev/null; then exec "$py" build.py; fi
done
echo "python 3 + fonttools 가 필요해요: pip install fonttools brotli" >&2
exit 1
