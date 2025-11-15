const table_convertImg = `
  id             INTEGER PRIMARY KEY,
  userId         TEXT,
  folder         TEXT,
  folder_source  TEXT,
  folder_convert TEXT,
  filePath       TEXT,
  created_at     TEXT
  `;
export { table_convertImg };