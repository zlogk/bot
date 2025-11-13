const table_raspiCpu= `
  id         INTEGER PRIMARY KEY,
  temp       REAL,
  load       REAL    NOT NULL,
  created_at TEXT
`
export {table_raspiCpu};