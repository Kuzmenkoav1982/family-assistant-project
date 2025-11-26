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
    console.log('[UPLOAD] Starting upload process');
    const data = JSON.parse(body || '{}');
    const { image, filename } = data;

    console.log('[UPLOAD] Image length:', image?.length || 0);
    console.log('[UPLOAD] Filename:', filename);

    if (!image) {
      console.log('[UPLOAD] No image provided');
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
    console.log('[UPLOAD] Base64 data length:', base64Data.length);
    
    // Конвертируем base64 в бинарные данные
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('[UPLOAD] Binary data size:', bytes.length);
    
    const uploadResponse = await fetch('https://cdn.poehali.dev/upload', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': bytes.length.toString()
      },
      body: bytes
    });

    console.log('[UPLOAD] Upload response status:', uploadResponse.status);

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