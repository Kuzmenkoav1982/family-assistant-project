#!/bin/bash

# Get download URL from Yandex API
echo "Getting download URL from Yandex API..."
API_RESPONSE=$(curl -s "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=https://disk.yandex.ru/i/HZKMkpsT6mc66A")

# Extract href from JSON response
DOWNLOAD_URL=$(echo "$API_RESPONSE" | grep -o '"href":"[^"]*"' | sed 's/"href":"//;s/"//')

if [ -z "$DOWNLOAD_URL" ]; then
    echo "Error: Could not get download URL"
    echo "API Response: $API_RESPONSE"
    exit 1
fi

echo "Download URL obtained"
echo "Downloading file..."

# Download the file
curl -L -o "public/domovoiCookTransform.mp4" "$DOWNLOAD_URL"

# Check if download was successful
if [ $? -eq 0 ]; then
    FILE_SIZE=$(stat -f%z "public/domovoiCookTransform.mp4" 2>/dev/null || stat -c%s "public/domovoiCookTransform.mp4" 2>/dev/null)
    ABS_PATH=$(cd "$(dirname "public/domovoiCookTransform.mp4")" && pwd)/$(basename "public/domovoiCookTransform.mp4")
    
    echo ""
    echo "✓ Download successful!"
    echo "✓ File saved to: $ABS_PATH"
    echo "✓ File size: $FILE_SIZE bytes"
    
    # Convert to MB
    MB=$(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc)
    echo "✓ File size: $MB MB"
else
    echo "✗ Download failed!"
    exit 1
fi
