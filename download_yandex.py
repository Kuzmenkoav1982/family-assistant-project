#!/usr/bin/env python3
import urllib.request
import json
import os

# Step 1: Get the direct download URL from Yandex API
public_url = "https://disk.yandex.ru/i/HZKMkpsT6mc66A"
api_url = f"https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key={public_url}"

print(f"Requesting download URL from Yandex API...")
print(f"API URL: {api_url}")

try:
    # Get the download URL
    with urllib.request.urlopen(api_url) as response:
        data = json.loads(response.read().decode('utf-8'))
        download_url = data.get('href')
        
    if not download_url:
        print("Error: Could not get download URL from API response")
        print(f"Response: {data}")
        exit(1)
    
    print(f"Download URL obtained successfully")
    print(f"Downloading file...")
    
    # Step 2: Download the file
    output_path = "public/domovoiCookTransform.mp4"
    
    with urllib.request.urlopen(download_url) as response:
        file_data = response.read()
        
    # Step 3: Save the file
    with open(output_path, 'wb') as f:
        f.write(file_data)
    
    # Step 4: Verify the download
    file_size = os.path.getsize(output_path)
    abs_path = os.path.abspath(output_path)
    
    print(f"\n✓ Download successful!")
    print(f"✓ File saved to: {abs_path}")
    print(f"✓ File size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)")
    
    # Verify it's close to expected size (2.1 MB = ~2,205,824 bytes)
    expected_size = 2205824
    if abs(file_size - expected_size) < 1000:  # Within 1KB tolerance
        print(f"✓ File size matches expected size (~2.1 MB)")
    else:
        print(f"⚠ Warning: File size differs from expected {expected_size} bytes")
    
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    print(f"URL: {e.url}")
    exit(1)
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
    exit(1)
