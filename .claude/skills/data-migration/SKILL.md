---
name: data-migration
description: Use when user asks to create migration scripts, migrate database, convert IDs to UUIDs, transform ID formats, change database IDs, migrate db.json, or restructure database schemas. Handles ID conversions, UUID transformations, and maintaining referential integrity during migrations.
---

# Data Migration Script Creation

Generate robust, transactional migration scripts for db.json databases that maintain referential integrity during transformations.

## Core Principles

1. **Analyze dependencies first** - Understand the relationship graph
2. **Plan phases by dependency order** - Parent tables before children
3. **Maintain referential integrity** - Never create orphaned references
4. **Make it transactional** - All changes succeed or all fail
5. **Include validation** - Verify integrity before and after
6. **Provide rollback** - Always enable reverting changes

## Step 1: Analyze Database Structure

**IMPORTANT: Use the schema analysis script first:**

Run the schema analyzer to get a condensed view of the database structure:

```bash
node .claude/skills/data-migration/scripts/analyze-schema.js path/to/db.json
```

This script will output:
1. **Tables**: All tables with record counts and ID formats
2. **Fields**: Field names with types and nullability
3. **Foreign key relationships**: Detected by analyzing field names (ending in `Id`/`_id`) and verifying referenced IDs exist
4. **Migration order**: Tables grouped by dependency phase

Use this analysis to understand:
- Which tables are parents (no foreign keys)
- Which tables are children (have foreign keys)
- The correct order for migration phases

## Step 2: Required Migration Phases

Every migration script must have these phases in order:

### Phase 1: Backup
- Create backup file before any changes (e.g., `db.backup.json`)
- Use `fs.writeFileSync()` for atomic write

### Phase 2: Load Data
- Read and parse db.json
- Log what was loaded

### Phase 3: Pre-Migration Validation
Check data integrity BEFORE making changes:
- All foreign keys reference existing records
- No duplicate IDs
- Expected structure exists
- **Fail fast** if validation fails

### Phase 4: Migration
Process in dependency order:

**For parent tables (no foreign keys):**
1. Create ID mapping object: `idMappings[tableName] = {}`
2. For each record: generate new ID, store mapping `oldId → newId`
3. Update the record's primary key

**For child tables (have foreign keys):**
1. Transform primary keys (same as parents)
2. Update foreign keys using parent table mappings
3. Handle optional foreign keys (check if defined first)

### Phase 5: Post-Migration Validation
Verify the migration succeeded:
- All IDs have the new format
- No orphaned foreign keys exist
- Record counts match pre-migration
- Referential integrity is intact

### Phase 6: Save
- Write migrated data atomically using `fs.writeFileSync()`
- Format JSON with proper indentation: `JSON.stringify(data, null, 2)`

## Step 3: Critical Implementation Details

### ID Mapping Structure
```javascript
const idMappings = {
  tableName: { oldId1: newId1, oldId2: newId2 }
};
```

### Handling Optional Foreign Keys
Always check if field exists before mapping:
```javascript
if (record.foreignKeyField) {
  record.foreignKeyField = idMappings.parentTable[record.foreignKeyField];
}
```

### Atomic Transaction Pattern
For file-based databases:
1. Load entire database into memory
2. Perform ALL transformations in memory
3. Validate completely
4. Write once atomically

### Error Handling
Wrap execution in try/catch:
- On error: log clear message, show rollback command, exit(1)
- On success: show summary and rollback instructions

## Step 4: Script Structure Template

Your generated script should follow this structure:

```javascript
const fs = require('fs');
const crypto = require('crypto'); // For UUIDs: crypto.randomUUID()

const DB_FILE = 'db.json';
const BACKUP_FILE = 'db.backup.json';

function createBackup() { /* ... */ }
function loadData() { /* ... */ }
function validatePreMigration(data) { /* ... */ }
function migrateData(data) { /* ... */ }
function validatePostMigration(data) { /* ... */ }
function saveData(data) { /* ... */ }

function main() {
  try {
    createBackup();
    const data = loadData();
    validatePreMigration(data);
    const { data: migratedData, idMappings } = migrateData(data);
    validatePostMigration(migratedData);
    saveData(migratedData);
    // Success message + rollback instructions
  } catch (error) {
    // Error message + rollback instructions
    process.exit(1);
  }
}

main();
```

**Important:** Use only Node.js built-in modules (`crypto`, `fs`, `path`) to avoid external dependencies.

## Step 5: Validation Patterns

### Pre-Migration Validation
For each foreign key relationship, verify the reference exists:
```javascript
data.childTable.forEach(record => {
  if (record.foreignKeyField) {
    const exists = data.parentTable.find(p => p.id === record.foreignKeyField);
    if (!exists) {
      errors.push(`Record ${record.id} references non-existent parent`);
    }
  }
});
```

### Post-Migration Validation
- Verify new ID format (e.g., UUID pattern, integer range, etc.)
- Re-check all foreign key relationships
- Confirm no data loss (record counts match)

## Generated Script Checklist

- ✅ Creates backup before changes
- ✅ Pre-migration validation with clear error messages
- ✅ Migrates tables in dependency order
- ✅ Maintains ID mappings for referential integrity
- ✅ Updates foreign keys using mappings
- ✅ Handles optional foreign keys safely
- ✅ Post-migration validation
- ✅ Clear console output showing progress
- ✅ Rollback instructions in output
- ✅ Atomic execution

## Common ID Transformations

**UUIDs (use Node.js built-in crypto):**
```javascript
const crypto = require('crypto');
const newId = crypto.randomUUID();
```

**Sequential integers:**
```javascript
let counter = 1;
const newId = (counter++).toString();
```

**Timestamp-based:**
```javascript
const newId = `${tableName}_${Date.now()}_${index}`;
```

**Note:** Prefer Node.js built-in modules (`crypto`, `fs`, `path`) over external packages to avoid dependency issues.

## Output Format

Provide clear progress logging:
```
==========================================
DATABASE MIGRATION: [Description]
==========================================

Creating backup...
✓ Backup created

Loading database...
✓ Loaded N tables

Validating pre-migration state...
✓ Validation passed

Starting migration...
  Phase 1: Migrating [table]...
    ✓ Migrated N records
...
✓ Migration complete

Validating post-migration state...
✓ Validation passed

Saving migrated data...
✓ Saved

==========================================
✓ MIGRATION COMPLETED SUCCESSFULLY
==========================================

To rollback: cp db.backup.json db.json
```
