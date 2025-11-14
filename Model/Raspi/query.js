const table_raspiCpu = `
  id         INTEGER PRIMARY KEY,
  temp       REAL,
  load       REAL,
  created_at TEXT
`;

const table_raspiRam = `
  id         INTEGER PRIMARY KEY,
  use        REAL,
  free       REAL,
  mem_percent_used REAL,
  created_at TEXT
`;

const table_raspiDisk = `
  id         INTEGER PRIMARY KEY,
  use        REAL,
  free       REAL,
  created_at TEXT
`;

const table_raspiUptime = `
  id     INTEGER PRIMARY KEY,
  uptime REAL
`;
export { table_raspiCpu, table_raspiRam, table_raspiDisk, table_raspiUptime };