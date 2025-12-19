#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

async function getDownloadUrl(publicUrl) {
    return new Promise((resolve, reject) => {
        const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
        
        console.log('Requesting download URL from Yandex API...');
        
        https.get(apiUrl, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.href) {
                        resolve(json.href);
                    } else {
                        reject(new Error('No href in response: ' + data));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        console.log('Downloading file...');
        
        https.get(url, (res) => {
            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadFile(res.headers.location, outputPath)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    try {
        const publicUrl = 'https://disk.yandex.ru/i/HZKMkpsT6mc66A';
        const outputPath = path.join(__dirname, 'public', 'domovoiCookTransform.mp4');
        
        // Get download URL
        const downloadUrl = await getDownloadUrl(publicUrl);
        console.log('Download URL obtained successfully');
        
        // Download file
        await downloadFile(downloadUrl, outputPath);
        
        // Verify
        const stats = fs.statSync(outputPath);
        const absolutePath = path.resolve(outputPath);
        
        console.log('\n✓ Download successful!');
        console.log(`✓ File saved to: ${absolutePath}`);
        console.log(`✓ File size: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        
        const expectedSize = 2205824;
        if (Math.abs(stats.size - expectedSize) < 1000) {
            console.log('✓ File size matches expected size (~2.1 MB)');
        } else {
            console.log(`⚠ Warning: File size differs from expected ${expectedSize} bytes`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
