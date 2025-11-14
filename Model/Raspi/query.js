const table_raspiCpu = `
  id         INTEGER PRIMARY KEY,
  temp       TEXT,
  load       TEXT,
  created_at TEXT
`;

const table_raspiRam = `
  id         INTEGER PRIMARY KEY,
  use        TEXT,
  total       TEXT,
  mem_percent_used REAL,
  created_at TEXT
`;

const table_raspiDisk = `
  id         INTEGER PRIMARY KEY,
  use        TEXT,
  total      TEXT,
  free       TEXT,
  disk_percent_used REAL,
  created_at TEXT
`;

const table_raspiUptime = `
  id     INTEGER PRIMARY KEY,
  uptime TEXT,
  created_at TEXT
`;
const table_raspiNetwork = `
  id INTEGER PRIMARY KEY,
  public_ip TEXT,
  LAN_ip TEXT,
  created_at TEXT
`;
export { table_raspiCpu, table_raspiRam, table_raspiDisk, table_raspiUptime, table_raspiNetwork };