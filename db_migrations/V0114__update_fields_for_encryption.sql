-- V0114: Обновление типов полей для шифрования медицинских данных
-- Изменяем типы полей для хранения зашифрованных данных в формате "nonce:ciphertext"

-- health_profiles: allergies и chronic_diseases теперь TEXT для зашифрованного JSON
ALTER TABLE health_profiles 
  ALTER COLUMN allergies TYPE TEXT USING COALESCE(allergies::text, ''),
  ALTER COLUMN chronic_diseases TYPE TEXT USING COALESCE(chronic_diseases::text, '');

-- health_records: description, diagnosis, recommendations теперь TEXT для зашифрованных данных
ALTER TABLE health_records
  ALTER COLUMN description TYPE TEXT,
  ALTER COLUMN diagnosis TYPE TEXT,
  ALTER COLUMN recommendations TYPE TEXT;

-- medications: name теперь TEXT для зашифрованного названия
ALTER TABLE medications
  ALTER COLUMN name TYPE TEXT;

-- insurance_policies: policy_number теперь TEXT для зашифрованного номера
ALTER TABLE insurance_policies
  ALTER COLUMN policy_number TYPE TEXT;