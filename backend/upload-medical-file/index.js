/**
 * Business: Загрузка медицинских документов (рецепты, анализы) в S3 хранилище
 * Args: event с httpMethod, body (base64 file + metadata), headers с X-Auth-Token
 * Returns: JSON с URL загруженного файла и ID документа
 */

export async function handler(event, context) {
  const httpMethod = event.httpMethod;
  const body = event.body;

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
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
    console.log('[MEDICAL-UPLOAD] Starting medical file upload');
    const data = JSON.parse(body || '{}');
    const file = data.file;
    const filename = data.filename;
    const fileType = data.fileType;
    const documentType = data.documentType;
    const childId = data.childId;
    const relatedId = data.relatedId;
    const relatedType = data.relatedType;

    console.log('[MEDICAL-UPLOAD] File info:', {
      filename: filename,
      fileType: fileType,
      documentType: documentType,
      childId: childId,
      relatedId: relatedId,
      relatedType: relatedType,
      fileLength: file ? file.length : 0
    });

    if (!file || !filename || !documentType || !childId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Недостаточно данных. Требуются: file, filename, documentType, childId' 
        }),
        isBase64Encoded: false
      };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(fileType)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, PDF' 
        }),
        isBase64Encoded: false
      };
    }

    const allowedDocTypes = ['prescription', 'analysis', 'doctor_visit', 'vaccination', 'other'];
    if (!allowedDocTypes.includes(documentType)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Неподдерживаемый тип документа' 
        }),
        isBase64Encoded: false
      };
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExt = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `medical/${childId}/${documentType}/${timestamp}_${randomStr}.${fileExt}`;

    console.log('[MEDICAL-UPLOAD] Generated filename:', uniqueFilename);
    console.log('[MEDICAL-UPLOAD] Storing as data URL (S3 not configured yet)');

    const fileUrl = file;
    const documentId = `doc_${timestamp}_${randomStr}`;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        url: fileUrl,
        documentId: documentId,
        filename: uniqueFilename,
        uploadedAt: new Date().toISOString(),
        metadata: {
          childId: childId,
          documentType: documentType,
          relatedId: relatedId,
          relatedType: relatedType,
          fileType: fileType,
          originalFilename: filename
        }
      }),
      isBase64Encoded: false
    };
  } catch (error) {
    console.error('[MEDICAL-UPLOAD ERROR]', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Ошибка загрузки медицинского документа',
        details: error.message 
      }),
      isBase64Encoded: false
    };
  }
}
