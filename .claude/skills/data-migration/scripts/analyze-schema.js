#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Analyzes db.json schema and outputs condensed format
 * Usage: node analyze-schema.js [path-to-db.json]
 */

function analyzeSchema(dbPath) {
  // Read and parse db.json
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const schema = {
    tables: {},
    relationships: [],
    migrationOrder: []
  };

  // Analyze each table
  Object.keys(data).forEach(tableName => {
    const records = data[tableName];
    if (!Array.isArray(records) || records.length === 0) {
      schema.tables[tableName] = { fields: {}, idFormat: 'unknown', recordCount: 0 };
      return;
    }

    const tableSchema = {
      fields: {},
      idFormat: 'unknown',
      recordCount: records.length
    };

    // Analyze first record for field types
    const sampleRecord = records[0];
    Object.keys(sampleRecord).forEach(fieldName => {
      const value = sampleRecord[fieldName];
      tableSchema.fields[fieldName] = {
        type: typeof value,
        nullable: false // We'll check this below
      };
    });

    // Check all records to find nullable fields and ID format
    const idValues = [];
    records.forEach(record => {
      if (record.id) {
        idValues.push(record.id);
      }

      Object.keys(tableSchema.fields).forEach(fieldName => {
        if (record[fieldName] === null || record[fieldName] === undefined) {
          tableSchema.fields[fieldName].nullable = true;
        }
      });
    });

    // Determine ID format
    if (idValues.length > 0) {
      const hasUUID = idValues.some(id => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
      const hasSimpleNumber = idValues.some(id => /^\d+$/.test(id));
      const hasHex = idValues.some(id => /^[0-9a-f]+$/i.test(id) && id.length > 1);

      if (hasUUID) {
        tableSchema.idFormat = 'uuid';
      } else if (hasSimpleNumber && hasHex) {
        tableSchema.idFormat = 'mixed (numbers and hex)';
      } else if (hasSimpleNumber) {
        tableSchema.idFormat = 'simple numbers';
      } else if (hasHex) {
        tableSchema.idFormat = 'hexadecimal';
      }
    }

    schema.tables[tableName] = tableSchema;
  });

  // Detect foreign key relationships
  Object.keys(schema.tables).forEach(tableName => {
    const table = schema.tables[tableName];
    const records = data[tableName];

    Object.keys(table.fields).forEach(fieldName => {
      // Check if field looks like a foreign key (ends with Id or _id)
      if ((fieldName.endsWith('Id') || fieldName.endsWith('_id')) && fieldName !== 'id') {
        // Try to infer referenced table by checking actual values
        let referencedTable = null;

        // Get sample values from this field
        const sampleValues = records
          .map(r => r[fieldName])
          .filter(v => v !== null && v !== undefined)
          .slice(0, 5);

        if (sampleValues.length === 0) {
          return; // Skip if no values
        }

        // Check which table has these IDs
        Object.keys(schema.tables).forEach(potentialTable => {
          if (potentialTable === tableName) return; // Skip self-references

          const tableRecords = data[potentialTable];
          const tableIds = new Set(tableRecords.map(r => r.id));

          // Check if sample values exist in this table's IDs
          const matchCount = sampleValues.filter(v => tableIds.has(v)).length;

          if (matchCount > 0) {
            referencedTable = potentialTable;
          }
        });

        if (referencedTable) {
          schema.relationships.push({
            from: tableName,
            to: referencedTable,
            field: fieldName,
            optional: table.fields[fieldName].nullable
          });
        }
      }
    });
  });

  // Determine migration order (topological sort)
  const dependencies = {};
  Object.keys(schema.tables).forEach(table => {
    dependencies[table] = [];
  });

  schema.relationships.forEach(rel => {
    if (!dependencies[rel.from].includes(rel.to)) {
      dependencies[rel.from].push(rel.to);
    }
  });

  // Simple topological sort
  const visited = new Set();
  const order = [];

  function visit(table) {
    if (visited.has(table)) return;
    visited.add(table);

    dependencies[table].forEach(dep => visit(dep));
    order.unshift(table); // Add to front (reverse order)
  }

  Object.keys(dependencies).forEach(table => visit(table));
  schema.migrationOrder = order;

  return schema;
}

function formatOutput(schema) {
  console.log('DATABASE SCHEMA ANALYSIS');
  console.log('========================\n');

  // Output tables
  Object.keys(schema.tables).forEach(tableName => {
    const table = schema.tables[tableName];
    console.log(`Table: ${tableName}`);
    console.log(`  Records: ${table.recordCount}`);
    console.log(`  ID Format: ${table.idFormat}`);
    console.log(`  Fields:`);

    Object.keys(table.fields).forEach(fieldName => {
      const field = table.fields[fieldName];
      const nullable = field.nullable ? ', nullable' : '';
      console.log(`    - ${fieldName} (${field.type}${nullable})`);
    });
    console.log();
  });

  // Output relationships
  if (schema.relationships.length > 0) {
    console.log('FOREIGN KEY RELATIONSHIPS');
    console.log('=========================\n');
    schema.relationships.forEach(rel => {
      const optional = rel.optional ? ' (optional)' : '';
      console.log(`${rel.from}.${rel.field} → ${rel.to}.id${optional}`);
    });
    console.log();
  }

  // Output migration order
  console.log('SUGGESTED MIGRATION ORDER');
  console.log('=========================\n');

  // Group by dependency level
  const levels = [];
  const dependencies = {};
  Object.keys(schema.tables).forEach(table => {
    dependencies[table] = [];
  });
  schema.relationships.forEach(rel => {
    if (!dependencies[rel.from].includes(rel.to)) {
      dependencies[rel.from].push(rel.to);
    }
  });

  const processed = new Set();
  let phase = 1;

  while (processed.size < schema.migrationOrder.length) {
    const currentLevel = [];

    schema.migrationOrder.forEach(table => {
      if (processed.has(table)) return;

      // Check if all dependencies are processed
      const allDepsProcessed = dependencies[table].every(dep => processed.has(dep));

      if (allDepsProcessed) {
        currentLevel.push(table);
      }
    });

    if (currentLevel.length > 0) {
      console.log(`Phase ${phase}: ${currentLevel.join(', ')}`);
      currentLevel.forEach(table => processed.add(table));
      phase++;
    } else {
      break; // Prevent infinite loop
    }
  }
}

// Main execution
const dbPath = process.argv[2] || 'ProtectionSociety/db.json';

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database file not found at ${dbPath}`);
  console.error(`Usage: node analyze-schema.js [path-to-db.json]`);
  process.exit(1);
}

try {
  const schema = analyzeSchema(dbPath);
  formatOutput(schema);
} catch (error) {
  console.error(`Error analyzing schema: ${error.message}`);
  process.exit(1);
}
