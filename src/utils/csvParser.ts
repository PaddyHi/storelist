import { StoreData, CSVImportResult } from '../types';

// Required CSV headers for validation
const REQUIRED_HEADERS = [
  'naam',
  'crmId',
  'storeId',
  'stad',
  'straat',
  'nummer',
  'postcode',
  'kanaal',
  'type',
  'fieldSalesRegio',
  'klantgroep',
  'prodSelect',
  'strategie',
  'storeSize'
];

// Essential fields that must be present (others can be empty)
const ESSENTIAL_FIELDS = [
  'naam',
  'stad',
  'prodSelect'
];

// CSV parser with robust error handling and validation
export class CSVParser {
  private static parseCSVLine(line: string): string[] {
    return this.parseCSVLineWithDelimiter(line, ',');
  }

  private static parseCSVLineWithDelimiter(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current.trim());
    return result;
  }

  private static validateHeaders(headers: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const requiredNormalized = REQUIRED_HEADERS.map(h => h.toLowerCase());

    // Check for missing required headers
    for (const required of requiredNormalized) {
      if (!normalizedHeaders.includes(required)) {
        errors.push(`Missing required header: ${required}`);
      }
    }

    // Check for duplicate headers
    const duplicates = normalizedHeaders.filter((header, index) => 
      normalizedHeaders.indexOf(header) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate headers found: ${duplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static validateStoreData(data: any, rowIndex: number): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate essential fields (errors) and other fields (warnings)
    for (const field of REQUIRED_HEADERS) {
      if (!data[field] || String(data[field]).trim() === '') {
        if (ESSENTIAL_FIELDS.includes(field)) {
          errors.push(`Row ${rowIndex}: Missing essential field '${field}'`);
        } else {
          warnings.push(`Row ${rowIndex}: Missing field '${field}' (will use default value)`);
        }
      }
    }

    // Validate prodSelect is a number
    if (data.prodSelect) {
      const prodSelect = Number(data.prodSelect);
      if (isNaN(prodSelect)) {
        errors.push(`Row ${rowIndex}: prodSelect must be a number`);
      } else if (prodSelect < 0) {
        warnings.push(`Row ${rowIndex}: prodSelect is negative`);
      }
    }

    // Validate storeSize is a number
    if (data.storeSize) {
      const storeSize = Number(data.storeSize);
      if (isNaN(storeSize)) {
        errors.push(`Row ${rowIndex}: storeSize must be a number`);
      } else if (storeSize < 0) {
        warnings.push(`Row ${rowIndex}: storeSize is negative`);
      }
    }

    // Validate postcode format (Dutch postcode format)
    if (data.postcode) {
      const postcodeRegex = /^\d{4}\s?[A-Z]{2}$/i;
      if (!postcodeRegex.test(data.postcode)) {
        warnings.push(`Row ${rowIndex}: postcode format may be invalid (expected format: 1234 AB)`);
      }
    }

    // Validate store type
    if (data.type && !['Filiaal', 'Franchiser'].includes(data.type)) {
      warnings.push(`Row ${rowIndex}: Unknown store type '${data.type}' (expected: Filiaal or Franchiser)`);
    }

    // Validate customer group (allow both letters A-D and numbers 1-9)
    if (data.klantgroep && !['A', 'B', 'C', 'D', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(data.klantgroep)) {
      warnings.push(`Row ${rowIndex}: Unknown customer group '${data.klantgroep}' (expected: A, B, C, D or 1-9)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static normalizeStoreData(data: any): StoreData {
    return {
      naam: String(data.naam || '').trim(),
      crmId: String(data.crmId || data.naam || 'UNKNOWN').trim(),
      storeId: String(data.storeId || data.crmId || 'UNKNOWN').trim(),
      stad: String(data.stad || '').trim(),
      straat: String(data.straat || 'Unknown Street').trim(),
      nummer: String(data.nummer || '1').trim(),
      postcode: String(data.postcode || '0000 XX').trim(),
      kanaal: String(data.kanaal || 'Unknown').trim(),
      type: String(data.type || 'Filiaal').trim(),
      fieldSalesRegio: String(data.fieldSalesRegio || 'Unknown Region').trim(),
      klantgroep: String(data.klantgroep || 'C').trim(),
      prodSelect: Number(data.prodSelect || 0),
      strategie: String(data.strategie || 'Executie').trim(),
      storeSize: Number(data.storeSize || 1000)
    };
  }

  public static parseCSV(csvContent: string): CSVImportResult {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        return {
          success: false,
          errors: ['CSV file is empty']
        };
      }

      // Auto-detect delimiter (comma or semicolon)
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';
      
      // Parse header row with detected delimiter
      const headers = this.parseCSVLineWithDelimiter(headerLine, delimiter);
      
      // Validate headers
      const headerValidation = this.validateHeaders(headers);
      if (!headerValidation.isValid) {
        return {
          success: false,
          errors: headerValidation.errors
        };
      }

      // Create header mapping (case-insensitive with variations)
      const headerMap: { [key: string]: number } = {};
      const headerVariations: { [key: string]: string[] } = {
        'naam': ['naam', 'name', 'store_name'],
        'crmId': ['crmid', 'crmId', 'crm_id'],
        'storeId': ['storeid', 'storeId', 'store_id'],
        'stad': ['stad', 'city', 'stadskanaal', 'plaats'],
        'straat': ['straat', 'street', 'address'],
        'nummer': ['nummer', 'number', 'huisnummer'],
        'postcode': ['postcode', 'postal_code', 'zip'],
        'kanaal': ['kanaal', 'channel'],
        'type': ['type', 'store_type'],
        'fieldSalesRegio': ['fieldsalesregio', 'fieldSalesRegio', 'field_sales_regio', 'regio', 'region'],
        'klantgroep': ['klantgroep', 'customer_group', 'group'],
        'prodSelect': ['prodselect', 'prodSelect', 'prod_select', 'revenue', 'sales'],
        'strategie': ['strategie', 'strategy'],
        'storeSize': ['storesize', 'storeSize', 'store_size', 'size']
      };

      headers.forEach((header: string, index: number) => {
        const normalizedHeader = header.trim().toLowerCase();
        for (const [requiredField, variations] of Object.entries(headerVariations)) {
          if (variations.some(variation => variation.toLowerCase() === normalizedHeader)) {
            headerMap[requiredField] = index;
            break;
          }
        }
      });

      const stores: StoreData[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const fields = this.parseCSVLineWithDelimiter(line, delimiter);
        
        // Skip empty lines
        if (fields.every(field => field.trim() === '')) {
          continue;
        }

        // Create data object
        const rowData: any = {};
        for (const [field, index] of Object.entries(headerMap)) {
          let value = fields[index] || '';
          
          // Clean currency values for prodSelect
          if (field === 'prodSelect' && value) {
            value = value.replace(/[€$£¥,\s]/g, '').replace(/\./g, '');
          }
          
          // Provide default values for empty storeSize
          if (field === 'storeSize' && (!value || value.trim() === '')) {
            value = '1000'; // Default store size
          }
          
          rowData[field] = value;
        }

        // Validate row data
        const validation = this.validateStoreData(rowData, i + 1);
        if (!validation.isValid) {
          errors.push(...validation.errors);
          continue; // Skip invalid rows
        }

        warnings.push(...validation.warnings);

        // Normalize and add to stores
        const normalizedStore = this.normalizeStoreData(rowData);
        stores.push(normalizedStore);
      }

      // Check if we have any valid stores
      if (stores.length === 0) {
        return {
          success: false,
          errors: ['No valid store data found', ...errors]
        };
      }

      // Return success if we have valid stores, even with warnings/errors
      return {
        success: true,
        data: stores,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        partialSuccess: errors.length > 0 && stores.length > 0
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  public static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file type
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must be a CSV file');
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static async parseFile(file: File): Promise<CSVImportResult> {
    // Validate file first
    const fileValidation = this.validateFile(file);
    if (!fileValidation.isValid) {
      return {
        success: false,
        errors: fileValidation.errors
      };
    }

    try {
      const content = await file.text();
      return this.parseCSV(content);
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  public static generateCSVTemplate(): string {
    const headers = REQUIRED_HEADERS.join(',');
    const exampleRow = [
      'Albert Heijn Example',
      'AH-999',
      'AH-EX-999',
      'Amsterdam',
      'Damrak',
      '1',
      '1012 JS',
      'Stedelijk Premium',
      'Filiaal',
      'Noord-Holland',
      'A',
      '15000',
      'Brandbuilding',
      '1200'
    ].join(',');

    return `${headers}\n${exampleRow}`;
  }

  public static exportToCSV(stores: StoreData[], filename: string = 'store-selection'): void {
    const headers = REQUIRED_HEADERS.join(',');
    const rows = stores.map(store => {
      return REQUIRED_HEADERS.map(field => {
        const value = store[field as keyof StoreData];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

// Utility function to detect CSV delimiter
export const detectDelimiter = (csvContent: string): string => {
  const sample = csvContent.split('\n').slice(0, 5).join('\n');
  const delimiters = [',', ';', '\t', '|'];
  
  let bestDelimiter = ',';
  let maxCount = 0;
  
  for (const delimiter of delimiters) {
    const count = (sample.match(new RegExp(delimiter, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }
  
  return bestDelimiter;
};

// Utility function to preview CSV data
export const previewCSV = (csvContent: string, maxRows: number = 5): { headers: string[]; rows: string[][]; totalRows: number } => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }
  
  // Use the same parsing logic as the CSVParser
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim());
    return result;
  };
  
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1, maxRows + 1).map(line => parseCSVLine(line));
  
  return {
    headers,
    rows,
    totalRows: lines.length - 1
  };
}; 