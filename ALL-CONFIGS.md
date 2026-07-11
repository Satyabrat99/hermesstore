# HermesStore — All Profile Configs
# Copy-paste these into the correct files

---

## Profile 1: Brain
## File: C:\Users\satya\HermesStore\.hermes-brain\config.yaml

model:
  provider: xiaomi
  model: mimo-v2.5-pro
terminal:
  cwd: C:\Users\satya\HermesStore
api_server:
  enabled: true
  key: hermesstore-brain-2026-secret-key-32c
  port: 8642
  host: 127.0.0.1
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
mcp_servers: {}

## File: C:\Users\satya\HermesStore\.hermes-brain\.env

API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-brain-2026-secret-key-32c
API_SERVER_PORT=8642
API_SERVER_HOST=127.0.0.1
XIAOMI_API_KEY=sk-scbyg8uqyzfrsqjm9suy6oagvipwh37lhdz1ti3h8dv0uabm

---

## Profile 2: Store Ops
## File: C:\Users\satya\HermesStore\.hermes-storeops\config.yaml

model:
  provider: xiaomi
  model: mimo-v2.5-pro
terminal:
  cwd: C:\Users\satya\HermesStore
api_server:
  enabled: true
  key: hermesstore-storeops-2026-secret-32c
  port: 8643
  host: 127.0.0.1
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
  - browser_navigate
  - browser_click
  - browser_type
  - browser_snapshot
  - image_generate
mcp_servers: {}

## File: C:\Users\satya\HermesStore\.hermes-storeops\.env

API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-storeops-2026-secret-32c
API_SERVER_PORT=8643
API_SERVER_HOST=127.0.0.1
XIAOMI_API_KEY=sk-scbyg8uqyzfrsqjm9suy6oagvipwh37lhdz1ti3h8dv0uabm

---

## Profile 3: Marketing
## File: C:\Users\satya\HermesStore\.hermes-marketing\config.yaml

model:
  provider: xiaomi
  model: mimo-v2.5-pro
terminal:
  cwd: C:\Users\satya\HermesStore
api_server:
  enabled: true
  key: hermesstore-marketing-2026-secret-32c
  port: 8644
  host: 127.0.0.1
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
  - browser_navigate
  - browser_click
  - browser_type
  - browser_snapshot
  - image_generate
mcp_servers: {}

## File: C:\Users\satya\HermesStore\.hermes-marketing\.env

API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-marketing-2026-secret-32c
API_SERVER_PORT=8644
API_SERVER_HOST=127.0.0.1
XIAOMI_API_KEY=sk-scbyg8uqyzfrsqjm9suy6oagvipwh37lhdz1ti3h8dv0uabm

---

## Profile 4: Customer/Brand
## File: C:\Users\satya\HermesStore\.hermes-customer\config.yaml

model:
  provider: xiaomi
  model: mimo-v2.5-pro
terminal:
  cwd: C:\Users\satya\HermesStore
api_server:
  enabled: true
  key: hermesstore-customer-2026-secret-32c
  port: 8645
  host: 127.0.0.1
tools:
  - terminal
  - read_file
  - write_file
  - search_files
  - web_search
  - web_extract
mcp_servers: {}

## File: C:\Users\satya\HermesStore\.hermes-customer\.env

API_SERVER_ENABLED=true
API_SERVER_KEY=hermesstore-customer-2026-secret-32c
API_SERVER_PORT=8645
API_SERVER_HOST=127.0.0.1
XIAOMI_API_KEY=sk-scbyg8uqyzfrsqjm9suy6oagvipwh37lhdz1ti3h8dv0uabm

---

## Start Commands

# Terminal 1 - Brain
cd C:\Users\satya\HermesStore
$env:HERMES_HOME="C:\Users\satya\HermesStore\.hermes-brain"
.\hermes-agent\.venv\Scripts\hermes.exe gateway

# Terminal 2 - Store Ops
cd C:\Users\satya\HermesStore
$env:HERMES_HOME="C:\Users\satya\HermesStore\.hermes-storeops"
.\hermes-agent\.venv\Scripts\hermes.exe gateway

# Terminal 3 - Marketing
cd C:\Users\satya\HermesStore
$env:HERMES_HOME="C:\Users\satya\HermesStore\.hermes-marketing"
.\hermes-agent\.venv\Scripts\hermes.exe gateway

# Terminal 4 - Customer
cd C:\Users\satya\HermesStore
$env:HERMES_HOME="C:\Users\satya\HermesStore\.hermes-customer"
.\hermes-agent\.venv\Scripts\hermes.exe gateway

# Terminal 5 - Frontend
cd C:\Users\satya\HermesStore\frontend
npm run build
npm run start
