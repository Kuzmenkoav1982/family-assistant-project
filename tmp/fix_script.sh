#!/bin/bash
cd /app
head -n 1351 src/pages/Index.tsx > /tmp/index_clean.tsx
mv /tmp/index_clean.tsx src/pages/Index.tsx
echo "Last 5 lines:"
tail -5 src/pages/Index.tsx
echo ""
echo "Line count:"
wc -l src/pages/Index.tsx
