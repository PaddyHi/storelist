import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, AlertTriangle, CheckCircle, X, ChevronRight, Eye, EyeOff, Info } from 'lucide-react';
import { StoreData, CSVImportResult } from '../types';
import { CSVParser } from '../utils/csvParser';

interface DataImportProps {
  onDataImport: (stores: StoreData[]) => void;
  onNext: () => void;
}

export const DataImport: React.FC<DataImportProps> = ({ onDataImport, onNext }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'sample'>('upload');

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find((file: File) => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile) {
      setActiveTab('upload');
      await handleFileUpload(csvFile);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setSelectedFile(file);
    
    try {
      // Security validation
      const maxFileSize = 10 * 1024 * 1024; // 10MB limit
      const allowedTypes = ['text/csv', 'application/csv', '.csv'];
      
      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds 10MB limit. Current size: ${Math.round(file.size / 1024 / 1024)}MB`);
      }
      
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
        throw new Error(`Invalid file type. Only CSV files are allowed. Received: ${file.type || 'unknown'}`);
      }
      
      // Additional security: Check for suspicious file names
      const suspiciousPatterns = ['.exe', '.js', '.html', '.php', '.bat'];
      if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
        throw new Error('Potentially unsafe file detected. Please upload a valid CSV file.');
      }

      const result = await CSVParser.parseFile(file);
      setImportResult(result);
      
      if (result.success && result.data) {
        onDataImport(result.data);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveTab('upload');
      handleFileUpload(file);
    }
  };

  const handleUseSampleData = async () => {
    setActiveTab('sample');
    setIsLoading(true);
    
    try {
      // Fetch the sample CSV file from the public folder
      const response = await fetch('/sample-stores.csv');
      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }
      
      const csvText = await response.text();
      const result = await CSVParser.parseCSV(csvText);
      
      if (result.success && result.data) {
        onDataImport(result.data);
        setImportResult({
          success: true,
          data: result.data,
          warnings: [`Using sample data with ${result.data.length} Dutch retail stores from Albert Heijn, Jumbo, and Plus`]
        });
      } else {
        throw new Error('Failed to parse sample data');
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Failed to load sample data: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    setActiveTab('template');
    const template = CSVParser.generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store-list-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setImportResult(null);
    setSelectedFile(null);
    setActiveTab('upload');
    setShowDataPreview(false);
    onDataImport([]);
  };

  const canProceed = importResult?.success && importResult.data && importResult.data.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Page Header with Progress Context */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-content-900 mb-2">
                Import Store Data
              </h2>
              <p className="text-content-600">
                Start by importing your store data to begin the selection optimization process
              </p>
            </div>

          </div>
          
          {/* Guided Flow Tabs */}
          <div className="flex space-x-1 bg-content-100 p-1 rounded-lg" role="tablist" aria-label="Data import options">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'upload' 
                  ? 'bg-white text-content-900 shadow-sm' 
                  : 'text-content-600 hover:text-content-900'
              }`}
              role="tab"
              aria-selected={activeTab === 'upload'}
              aria-controls="upload-panel"
              id="upload-tab"
              tabIndex={activeTab === 'upload' ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  setActiveTab('sample');
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setActiveTab('sample');
                }
              }}
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-content-900 text-white text-xs flex items-center justify-center font-bold" aria-hidden="true">1</span>
                <span>Upload Your Data</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sample')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'sample' 
                  ? 'bg-white text-content-900 shadow-sm' 
                  : 'text-content-600 hover:text-content-900'
              }`}
              role="tab"
              aria-selected={activeTab === 'sample'}
              aria-controls="sample-panel"
              id="sample-tab"
              tabIndex={activeTab === 'sample' ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  setActiveTab('upload');
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setActiveTab('upload');
                }
              }}
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-content-400 text-white text-xs flex items-center justify-center font-bold" aria-hidden="true">2</span>
                <span>Start with Sample Data</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === 'sample' && (
              <div id="sample-panel" role="tabpanel" aria-labelledby="sample-tab" className="bg-white rounded-xl border border-content-200 p-6">
                <div className="animate-fadeInUp">
                  <div className="card bg-gradient-to-br from-content-50 to-content-100 border-content-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-content-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-content-900 mb-2">
                        Start with Sample Data
                      </h3>
                      <p className="text-content-700 mb-6 max-w-md mx-auto">
                        Perfect for first-time users! Our sample dataset includes 30 Dutch retail stores from Albert Heijn, Jumbo, and Plus with store size data.
                      </p>
                      <div className="flex justify-center">
                        <button
                          onClick={handleUseSampleData}
                          className="btn-primary flex items-center justify-center px-8 py-3"
                          disabled={importResult?.success && activeTab === 'sample'}
                          aria-describedby="sample-data-description"
                        >
                          {importResult?.success && activeTab === 'sample' ? (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                              Sample Data Loaded
                            </>
                          ) : (
                            <>
                              <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
                              Use Sample Data
                            </>
                          )}
                        </button>
                        {importResult?.success && activeTab === 'sample' && (
                          <button
                            onClick={() => setShowDataPreview(!showDataPreview)}
                            className="btn-secondary flex items-center justify-center px-6 py-3"
                            aria-expanded={showDataPreview}
                            aria-controls="data-preview"
                          >
                            {showDataPreview ? (
                              <>
                                <EyeOff className="w-5 h-5 mr-2" aria-hidden="true" />
                                Hide Preview
                              </>
                            ) : (
                              <>
                                <Eye className="w-5 h-5 mr-2" aria-hidden="true" />
                                View Data Preview
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div id="upload-panel" role="tabpanel" aria-labelledby="upload-tab" className="bg-white rounded-xl border border-content-200 p-6">
                <div className="animate-fadeInUp">
                  <div className="card">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Upload className="mr-2 h-5 w-5 text-content-600" />
                        Upload Your CSV File
                      </h3>
                      <div className="bg-content-50 border border-content-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-content-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-content-600">
                            <p className="font-medium mb-1">CSV Requirements:</p>
                            <ul className="text-xs space-y-1">
                              <li>• Maximum file size: 5MB</li>
                              <li>• Required columns: Store Name, City, Region, Revenue</li>
                              <li>• Format: UTF-8 encoded CSV</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      role="region"
                      aria-label="File upload area"
                    >
                      <div className="flex flex-col items-center py-8">
                        <div className={`p-6 rounded-full mb-8 transition-all duration-300 ${
                          isDragging ? 'bg-accent-100 scale-110' : 'bg-content-100'
                        }`}>
                          <Upload className={`h-16 w-16 transition-colors duration-300 ${
                            isDragging ? 'text-accent-600' : 'text-content-400'
                          }`} aria-hidden="true" />
                        </div>
                        
                        <div className="text-center mb-8">
                          <p className="text-xl font-medium text-content-700 mb-3">
                            Drag and drop your CSV file here
                          </p>
                          <p className="text-content-500">
                            or click to browse your files
                          </p>
                        </div>
                        
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="csv-upload"
                          aria-describedby="file-requirements"
                        />
                        <label
                          htmlFor="csv-upload"
                          className="btn-primary cursor-pointer inline-flex items-center px-6 py-3 text-base font-medium"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              document.getElementById('csv-upload')?.click();
                            }
                          }}
                        >
                          <Upload className="w-5 h-5 mr-3" aria-hidden="true" />
                          Select CSV File
                        </label>
                        
                        <div id="file-requirements" className="text-sm text-content-500 mt-6 text-center">
                          Maximum file size: 10MB • CSV format only
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-content-200">
                          <div className="text-center">
                            <p className="text-sm text-content-600 mb-3">
                              Need a template? Download our CSV template with all required columns.
                            </p>
                            <button
                              onClick={handleDownloadTemplate}
                              className="btn-outline flex items-center justify-center mx-auto px-6 py-2"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Template CSV
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="mt-6 animate-fadeInUp">
                        <div className="bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-xl p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <FileText className="h-8 w-8 text-accent-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-accent-900">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-accent-700">
                                {(selectedFile.size / 1024).toFixed(1)} KB • CSV File
                              </p>
                            </div>
                            {isLoading && (
                              <div className="flex-shrink-0 ml-3">
                                <div className="loading-spinner w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Enhanced Results Section */}
          {importResult && (
            <div className="mb-8 animate-fadeInUp">
              {importResult.success ? (
                <div className="bg-content-50 border border-content-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-content-900 mr-3" />
                    <div>
                      <span className="text-content-900 font-semibold text-lg">
                        Data imported successfully!
                      </span>
                      <p className="text-content-700 text-sm mt-1">
                        {importResult.data?.length} stores loaded and ready for optimization
                      </p>
                    </div>
                  </div>
                  {importResult.warnings && importResult.warnings.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-content-700 font-medium mb-2">Warnings:</p>
                      <ul className="text-sm text-content-700 space-y-1">
                        {importResult.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <X className="h-6 w-6 text-warning-600 mr-3" />
                    <span className="text-warning-900 font-semibold text-lg">
                      Import failed
                    </span>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mb-4">
                      <ul className="text-sm text-warning-700 space-y-2">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="btn-secondary"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setActiveTab('template')}
                      className="btn-outline"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Data Preview */}
          {importResult?.success && importResult.data && (showDataPreview || activeTab === 'upload') && (
            <div className="mb-8 animate-fadeInUp">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                                     <h3 className="text-lg font-semibold flex items-center">
                     <Eye className="w-5 h-5 text-content-900 mr-2" />
                     Data Preview
                   </h3>
                  {activeTab === 'sample' && (
                    <button
                      onClick={() => setShowDataPreview(false)}
                      className="btn-ghost"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                                 {/* Enhanced Statistics */}
                 <div className="grid grid-cols-3 gap-4 mb-6">
                   <div className="text-center bg-content-50 rounded-lg p-4">
                     <div className="text-2xl font-bold text-content-900">{importResult.data.length}</div>
                     <div className="text-sm text-content-700 font-medium">Total Stores</div>
                   </div>
                   <div className="text-center bg-content-50 rounded-lg p-4">
                     <div className="text-2xl font-bold text-content-900">
                       {new Set(importResult.data.map(store => store.fieldSalesRegio)).size}
                     </div>
                     <div className="text-sm text-content-700 font-medium">Regions</div>
                   </div>
                   <div className="text-center bg-content-50 rounded-lg p-4">
                     <div className="text-2xl font-bold text-content-900">
                       {new Set(importResult.data.map(store => store.naam.split(' ')[0])).size}
                     </div>
                     <div className="text-sm text-content-700 font-medium">Retailers</div>
                   </div>
                 </div>
                
                {/* Enhanced Sample Data Table */}
                <div className="bg-content-50 rounded-xl p-4">
                  <h4 className="font-medium text-content-900 mb-3">Sample Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-content-200">
                          <th className="text-left pb-2 font-medium text-content-700">Store Name</th>
                          <th className="text-left pb-2 font-medium text-content-700">City</th>
                          <th className="text-left pb-2 font-medium text-content-700">Region</th>
                          <th className="text-right pb-2 font-medium text-content-700">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.data.slice(0, 5).map((store, index) => (
                          <tr key={index} className="border-b border-content-100">
                            <td className="py-2 font-medium text-content-900">{store.naam}</td>
                            <td className="py-2 text-content-600">{store.stad}</td>
                                                         <td className="py-2">
                               <span className="inline-block bg-content-100 text-content-800 px-2 py-1 rounded-full text-xs">
                                 {store.fieldSalesRegio}
                               </span>
                             </td>
                            <td className="py-2 text-right font-medium text-content-900">
                              €{store.prodSelect.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importResult.data.length > 5 && (
                      <div className="text-center mt-4 pt-4 border-t border-content-200">
                        <span className="text-sm text-content-500">
                          ... and {importResult.data.length - 5} more stores
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview */}
          {showDataPreview && importResult?.success && (
            <div className="mt-8" id="data-preview">
              <div className="bg-white rounded-xl border border-content-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" role="table" aria-label="Store data preview">
                    <thead>
                      <tr className="border-b border-content-200">
                        <th className="text-left p-3 font-medium text-content-700" scope="col">Store Name</th>
                        <th className="text-left p-3 font-medium text-content-700" scope="col">City</th>
                        <th className="text-left p-3 font-medium text-content-700" scope="col">Revenue</th>
                        <th className="text-left p-3 font-medium text-content-700" scope="col">Channel</th>
                        <th className="text-left p-3 font-medium text-content-700" scope="col">Customer Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.data?.slice(0, 5).map((store, index) => (
                        <tr key={index} className="border-b border-content-100">
                          <td className="p-3 text-content-900">{store.naam}</td>
                          <td className="p-3 text-content-700">{store.stad}</td>
                          <td className="p-3 text-content-700">€{store.prodSelect.toLocaleString()}</td>
                          <td className="p-3 text-content-700">{store.kanaal}</td>
                          <td className="p-3 text-content-700">{store.klantgroep}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importResult.data && importResult.data.length > 5 && (
                  <div className="text-center mt-4 pt-4 border-t border-content-200">
                    <span className="text-sm text-content-500">
                      ... and {importResult.data.length - 5} more stores
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-content-200">
            <button
              onClick={handleReset}
              className="btn-secondary"
              disabled={!importResult}
              aria-describedby="reset-description"
            >
              Start Over
            </button>
            <div id="reset-description" className="sr-only">
              Clear all imported data and start the import process again
            </div>
            
            {!canProceed && (
              <div className="text-sm text-content-500 italic">
                Import data to continue to the next step
              </div>
            )}
            
            {canProceed && (
              <button
                onClick={onNext}
                className="bg-content-900 hover:bg-content-800 text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
                aria-describedby="next-step-description"
              >
                Continue to Configure Target
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </button>
            )}
            <div id="next-step-description" className="sr-only">
              Proceed to the next step where you'll configure your target store selection
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="loading-title">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-content-900" aria-hidden="true"></div>
            </div>
            <p id="loading-title" className="text-center text-content-700">Processing CSV file...</p>
          </div>
        </div>
      )}
    </div>
  );
}; 