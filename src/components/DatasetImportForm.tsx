import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '@/config/api';

interface DatasetImportFormProps {
  onImportSuccess?: () => void;
}

const DatasetImportForm: React.FC<DatasetImportFormProps> = ({ onImportSuccess }) => {
  const [datasetName, setDatasetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
    setSuccess(null);
    setUploadProgress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(null);

    const file = selectedFile;
    if (!file) {
      setError('Please select a CSV file to upload');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (datasetName.trim()) {
        formData.append('dataset_name', datasetName.trim());
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', buildApiUrl('/datasets'));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              setSuccess(`Import started successfully! Job ID: ${data.job_id}`);
              setDatasetName('');
              setSelectedFile(null);
              setUploadProgress(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
              if (onImportSuccess) {
                onImportSuccess();
              }
              resolve();
            } catch (err) {
              setError('Failed to parse server response');
              setUploadProgress(null);
              reject(err);
            }
          } else {
            let errorMsg = 'Failed to start import';
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMsg = errorData.error || errorMsg;
            } catch {}
            setError(errorMsg);
            setUploadProgress(null);
            reject(new Error(errorMsg));
          }
        };
        xhr.onerror = () => {
          setError('Network error during upload');
          setUploadProgress(null);
          reject(new Error('Network error during upload'));
        };
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };
        xhr.send(formData);
      });
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start import');
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-dark-brand">
          <Upload className="h-5 w-5 text-primary-brand" />
          Import Dataset
        </CardTitle>
        <CardDescription className="text-secondary-brand">
          Import a new dataset by uploading a CSV file. The import will run in the background.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="text-dark-brand">CSV File *</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              ref={fileInputRef}
              disabled={isLoading}
              required
              onChange={handleFileChange}
              className="focus:ring-2 focus:ring-primary-brand focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataset-name" className="text-dark-brand">Dataset Name (Optional)</Label>
            <Input
              id="dataset-name"
              type="text"
              placeholder="My Dataset"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              disabled={isLoading}
              className="focus:ring-2 focus:ring-primary-brand focus:border-transparent"
            />
          </div>

          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-brand">Upload Progress</span>
                <span className="text-success-brand font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-brand h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-success-brand" />
              <AlertDescription className="text-success-brand">{success}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !selectedFile}
            className={`w-full ${
              isLoading || !selectedFile
                ? 'bg-secondary-brand text-white'
                : 'bg-primary-brand hover:bg-primary-brand/90 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DatasetImportForm; 