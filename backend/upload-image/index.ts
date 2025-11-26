/**
 * Business: Загрузка изображений на CDN с проксированием для решения CORS
 * Args: event с httpMethod, body (base64 image), headers с X-Auth-Token
 * Returns: JSON с URL загруженного изображения
 */

export async function handler(event, context) {
  const { httpMethod, body } = event;

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
      },
      body: '',
      isBase64Encoded: false
    };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Метод не поддерживается' }),
      isBase64Encoded: false
    };
  }

  try {
    const data = JSON.parse(body || '{}');
    const { image, filename } = data;

    if (!image) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Изображение не предоставлено' }),
        isBase64Encoded: false
      };
    }

    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    const filenameValue = filename || 'upload.jpg';
    
    const formDataParts = [];
    formDataParts.push(Buffer.from(`--${boundary}\r\n`));
    formDataParts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filenameValue}"\r\n`));
    formDataParts.push(Buffer.from('Content-Type: image/jpeg\r\n\r\n'));
    formDataParts.push(buffer);
    formDataParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    
    const formDataBuffer = Buffer.concat(formDataParts);

    const uploadResponse = await fetch('https://cdn.poehali.dev/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataBuffer.length.toString()
      },
      body: formDataBuffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Ошибка загрузки на CDN: ${uploadResponse.statusText} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        url: uploadResult.url || uploadResult.file_url || uploadResult.link
      }),
      isBase64Encoded: false
    };
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Ошибка загрузки изображения',
        details: error.message 
      }),
      isBase64Encoded: false
    };
  }
}