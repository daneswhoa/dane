import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export interface ExcelParseResult {
  success: boolean;
  message: string;
  sheets: {
    sheetName: string;
    rowCount: number;
    columns: string[];
    sampleData: any[];
    visualization?: {
      type: 'bar' | 'pie' | 'line' | 'table';
      xAxisKey: string;
      yAxisKeys: string[];
      title: string;
    };
  }[];
}

export class ExcelParserTool {
  static execute(params: { base64Data?: string; filePath?: string; fileName?: string }): ExcelParseResult {
    try {
      let workbook: XLSX.WorkBook;

      if (params.base64Data) {
        const buffer = Buffer.from(params.base64Data, 'base64');
        workbook = XLSX.read(buffer, { type: 'buffer' });
      } else if (params.filePath) {
        const resolvedPath = path.isAbsolute(params.filePath)
          ? params.filePath
          : path.resolve(process.cwd(), params.filePath);

        if (!fs.existsSync(resolvedPath)) {
          return { success: false, message: `File not found at: ${resolvedPath}`, sheets: [] };
        }
        workbook = XLSX.readFile(resolvedPath);
      } else {
        return { success: false, message: 'No file data or path provided.', sheets: [] };
      }

      const resultSheets: ExcelParseResult['sheets'] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (jsonRows.length === 0) {
          resultSheets.push({
            sheetName,
            rowCount: 0,
            columns: [],
            sampleData: [],
          });
          continue;
        }

        // Get all unique columns across the rows
        const columns = Array.from(
          new Set(jsonRows.flatMap(row => Object.keys(row)))
        );

        // Pick sample rows (up to 100 for token limits, but sample 5 for quick preview)
        const sampleData = jsonRows.slice(0, 5);

        // Generate recommended visualization dynamically
        const visualization = this.recommendVisualization(sheetName, columns, jsonRows);

        resultSheets.push({
          sheetName,
          rowCount: jsonRows.length,
          columns,
          sampleData,
          visualization,
        });
      }

      return {
        success: true,
        message: `Successfully parsed workbook with ${workbook.SheetNames.length} sheet(s).`,
        sheets: resultSheets,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error parsing excel: ${error.message}`,
        sheets: [],
      };
    }
  }

  private static recommendVisualization(
    sheetName: string,
    columns: string[],
    rows: any[]
  ): ExcelParseResult['sheets'][0]['visualization'] {
    // Look for columns that represent numbers or names/dates
    const numericKeys: string[] = [];
    const dateKeys: string[] = [];
    const stringKeys: string[] = [];

    // Analyze first 10 rows to determine key types
    const checkLimit = Math.min(rows.length, 10);
    for (const col of columns) {
      let numericCount = 0;
      let dateCount = 0;
      let stringCount = 0;

      for (let i = 0; i < checkLimit; i++) {
        const val = rows[i][col];
        if (val === null || val === undefined) continue;

        if (typeof val === 'number') {
          numericCount++;
        } else if (typeof val === 'string') {
          // Check for date pattern
          if (!isNaN(Date.parse(val)) && val.match(/^\d{4}[-/.]\d{2}[-/.]\d{2}/)) {
            dateCount++;
          } else if (!isNaN(Number(val))) {
            numericCount++;
          } else {
            stringCount++;
          }
        }
      }

      if (numericCount > checkLimit * 0.6) {
        numericKeys.push(col);
      } else if (dateCount > checkLimit * 0.6) {
        dateKeys.push(col);
      } else if (stringCount > checkLimit * 0.6) {
        stringKeys.push(col);
      }
    }

    // Recommendation logic:
    // 1. Time-series: If we have date keys and numeric keys, recommend a Line chart
    if (dateKeys.length > 0 && numericKeys.length > 0) {
      return {
        type: 'line',
        xAxisKey: dateKeys[0],
        yAxisKeys: [numericKeys[0]],
        title: `${sheetName} Trend Over Time`,
      };
    }

    // 2. Bar/Pie: If we have string keys (categories) and numeric keys (values)
    if (stringKeys.length > 0 && numericKeys.length > 0) {
      // Check cardinality of categories for Pie vs Bar
      const uniqueValues = new Set(rows.map(r => r[stringKeys[0]]));
      const isLowCardinality = uniqueValues.size <= 6;

      return {
        type: isLowCardinality ? 'pie' : 'bar',
        xAxisKey: stringKeys[0],
        yAxisKeys: [numericKeys[0]],
        title: `${sheetName} distribution by ${stringKeys[0]}`,
      };
    }

    // 3. Fallback: Table visualization
    return {
      type: 'table',
      xAxisKey: columns[0] || '',
      yAxisKeys: numericKeys.slice(0, 2),
      title: `${sheetName} Data Overview`,
    };
  }
}
