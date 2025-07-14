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

// CSV parser with robust error handling and validation
export class CSVParser {
  private static parseCSVLine(line: string): string[] {
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
      } else if (char === ',' && !inQuotes) {
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

    // Validate required fields
    for (const field of REQUIRED_HEADERS) {
      if (!data[field] || String(data[field]).trim() === '') {
        errors.push(`Row ${rowIndex}: Missing required field '${field}'`);
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

    // Validate customer group
    if (data.klantgroep && !['A', 'B', 'C', 'D'].includes(data.klantgroep)) {
      warnings.push(`Row ${rowIndex}: Unknown customer group '${data.klantgroep}' (expected: A, B, C, or D)`);
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
      crmId: String(data.crmId || '').trim(),
      storeId: String(data.storeId || '').trim(),
      stad: String(data.stad || '').trim(),
      straat: String(data.straat || '').trim(),
      nummer: String(data.nummer || '').trim(),
      postcode: String(data.postcode || '').trim(),
      kanaal: String(data.kanaal || '').trim(),
      type: String(data.type || '').trim(),
      fieldSalesRegio: String(data.fieldSalesRegio || '').trim(),
      klantgroep: String(data.klantgroep || '').trim(),
      prodSelect: Number(data.prodSelect || 0),
      strategie: String(data.strategie || '').trim(),
      storeSize: Number(data.storeSize || 0)
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

      // Parse header row
      const headerLine = lines[0];
      const headers = this.parseCSVLine(headerLine);
      
      // Validate headers
      const headerValidation = this.validateHeaders(headers);
      if (!headerValidation.isValid) {
        return {
          success: false,
          errors: headerValidation.errors
        };
      }

      // Create header mapping (case-insensitive)
      const headerMap: { [key: string]: number } = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.trim().toLowerCase();
        const matchedRequired = REQUIRED_HEADERS.find(req => req.toLowerCase() === normalizedHeader);
        if (matchedRequired) {
          headerMap[matchedRequired] = index;
        }
      });

      const stores: StoreData[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const fields = this.parseCSVLine(line);
        
        // Skip empty lines
        if (fields.every(field => field.trim() === '')) {
          continue;
        }

        // Create data object
        const rowData: any = {};
        for (const [field, index] of Object.entries(headerMap)) {
          rowData[field] = fields[index] || '';
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

      return {
        success: true,
        data: stores,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
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