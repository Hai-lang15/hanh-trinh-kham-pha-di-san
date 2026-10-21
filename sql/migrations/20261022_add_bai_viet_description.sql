-- Chạy file này trong database HTKPDS. Script an toàn nếu cột description đã tồn tại.
SET @has_description = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bai_viet'
    AND COLUMN_NAME = 'description'
);
SET @migration_sql = IF(
  @has_description = 0,
  'ALTER TABLE bai_viet ADD COLUMN description TEXT NULL AFTER tieu_de',
  'SELECT ''Cot description da ton tai, khong can them.'' AS migration_status'
);
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
