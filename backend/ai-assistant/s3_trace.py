"""Минимальный модуль записи полного trace в S3 для ai-assistant.
Используется только при ошибках/таймаутах (Domovoy Studio §3.4, правило 5).
"""
import json
import os
from datetime import datetime
from typing import Any, Dict, Optional

import boto3

BUCKET = 'files'
PREFIX = 'domovoy-studio/traces'


def _s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def _trace_key(trace_uuid: str) -> str:
    dt = datetime.utcnow()
    return f"{PREFIX}/{dt.strftime('%Y-%m-%d')}/{trace_uuid}.json"


def write_full_trace(trace_uuid: str, payload: Dict[str, Any]) -> Optional[str]:
    try:
        s3 = _s3_client()
        key = _trace_key(trace_uuid)
        body = json.dumps(payload, ensure_ascii=False, default=str).encode('utf-8')
        s3.put_object(Bucket=BUCKET, Key=key, Body=body, ContentType='application/json; charset=utf-8')
        return key
    except Exception as e:
        print(f'[ai-assistant s3_trace] failed: {e}')
        return None
