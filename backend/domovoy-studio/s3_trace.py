"""
Модуль работы с полным trace в S3.

Полный trace — JSON-файл, содержащий все слои pipeline: blocks
(persona/role_prompt/safety/memory/context/user_question),
итоговый prompt, raw-запрос/ответ модели, тайминги, ошибки.

Бакет: files (poehali.dev S3).
Ключ: domovoy-studio/traces/{YYYY-MM-DD}/{trace_uuid}.json
"""
import json
import os
from datetime import datetime
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError

BUCKET = 'files'
PREFIX = 'domovoy-studio/traces'


def _s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def _trace_key(trace_uuid: str, created_at: Optional[datetime] = None) -> str:
    dt = created_at or datetime.utcnow()
    return f"{PREFIX}/{dt.strftime('%Y-%m-%d')}/{trace_uuid}.json"


def write_full_trace(trace_uuid: str, payload: Dict[str, Any]) -> Optional[str]:
    """Кладёт полный trace в S3. Возвращает s3_key или None при ошибке."""
    try:
        s3 = _s3_client()
        key = _trace_key(trace_uuid)
        body = json.dumps(payload, ensure_ascii=False, default=str).encode('utf-8')
        s3.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=body,
            ContentType='application/json; charset=utf-8',
        )
        return key
    except Exception as e:
        print(f'[s3_trace.write] failed: {e}')
        return None


def read_full_trace(s3_key: str) -> Optional[Dict[str, Any]]:
    """Читает полный trace из S3."""
    try:
        s3 = _s3_client()
        obj = s3.get_object(Bucket=BUCKET, Key=s3_key)
        data = obj['Body'].read()
        return json.loads(data.decode('utf-8'))
    except ClientError as e:
        print(f'[s3_trace.read] client error: {e}')
        return None
    except Exception as e:
        print(f'[s3_trace.read] failed: {e}')
        return None
