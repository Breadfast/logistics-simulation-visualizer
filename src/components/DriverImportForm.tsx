import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '@/config/api';

interface DriverImportFormProps {
  datasetId: number;
}

const DriverImportForm: React.FC<DriverImportFormProps> = ({ datasetId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSuccess(null);
    setError(null);
    setUploadProgress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    setUploadProgress(null);
    if (!file) {
      setError('Please select a JSON file to upload');
      setIsLoading(false);
      return;
    }
    if (!datasetId) {
      setError('No dataset selected.');
      setIsLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataset_id', String(datasetId));
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', buildApiUrl('/drivers/import'));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              setSuccess(data.message || 'Import successful!');
              setFile(null);
              setUploadProgress(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
              resolve();
            } catch (err) {
              setError('Failed to parse server response');
              setUploadProgress(null);
              reject(err);
            }
          } else {
            let errorMsg = 'Import failed';
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
      setError('Network or server error');
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
          Import Drivers & Checkins
        </CardTitle>
        <CardDescription className="text-secondary-brand">
          Import drivers and their checkins by uploading a JSON file. The import will run in the background.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drivers-json" className="text-dark-brand">Drivers JSON File *</Label>
            <Input
              id="drivers-json"
              type="file"
              accept="application/json,.json"
              ref={fileInputRef}
              disabled={isLoading}
              required
              onChange={handleFileChange}
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
            disabled={isLoading || !file} 
            className={`w-full ${
              isLoading || !file
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
                Import
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverImportForm; 