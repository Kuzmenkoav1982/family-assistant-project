#!/bin/bash
set -e

echo "Step 1: Creating clean version with first 1351 lines..."
head -n 1351 src/pages/Index.tsx > /tmp/index_clean.tsx

echo "Step 2: Replacing original file..."
mv /tmp/index_clean.tsx src/pages/Index.tsx

echo "Step 3: Verifying last 5 lines..."
echo "=== Last 5 lines of src/pages/Index.tsx ==="
tail -5 src/pages/Index.tsx

echo ""
echo "Step 4: Verifying line count..."
echo "=== Line count ==="
wc -l src/pages/Index.tsx
