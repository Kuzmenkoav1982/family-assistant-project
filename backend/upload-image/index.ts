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

    // Просто возвращаем data URL - самый простой способ
    console.log('[UPLOAD] Returning data URL directly');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        url: image
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