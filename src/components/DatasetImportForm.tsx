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
  const [fpId, setFpId] = useState('');
  const [fpIdOptions, setFpIdOptions] = useState<string[]>([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFpIds, setIsFetchingFpIds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setFpId('');
    setFpIdOptions([]);
    if (!file) return;
    setIsFetchingFpIds(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(buildApiUrl('/datasets/fp_ids'), {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        let errorMsg = 'Failed to fetch FP IDs';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setFpIdOptions(data.fp_ids || []);
      if ((data.fp_ids || []).length === 1) {
        setFpId(data.fp_ids[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch FP IDs');
    } finally {
      setIsFetchingFpIds(false);
    }
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
    if (!fpId.trim()) {
      setError('Please select an FP ID');
      setIsLoading(false);
      return;
    }
    if (!lat.trim() || !lon.trim()) {
      setError('Please enter both latitude and longitude');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (datasetName.trim()) {
        formData.append('dataset_name', datasetName.trim());
      }
      formData.append('fp_id', fpId.trim());
      formData.append('lat', lat.trim());
      formData.append('lon', lon.trim());

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', buildApiUrl('/datasets'));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              setSuccess(`Import started successfully! Job ID: ${data.job_id}`);
              setDatasetName('');
              setFpId('');
              setFpIdOptions([]);
              setLat('');
              setLon('');
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
              disabled={isLoading || isFetchingFpIds}
              required
              onChange={handleFileChange}
              className="focus:ring-2 focus:ring-primary-brand focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fp-id" className="text-dark-brand">FP ID *</Label>
            <select
              id="fp-id"
              value={fpId}
              onChange={e => setFpId(e.target.value)}
              disabled={isLoading || isFetchingFpIds || fpIdOptions.length === 0}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-transparent"
            >
              <option value="" disabled>
                {isFetchingFpIds ? 'Loading FP IDs...' : 'Select FP ID'}
              </option>
              {fpIdOptions.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat" className="text-dark-brand">Latitude *</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                placeholder="29.975509"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={isLoading}
                required
                className="focus:ring-2 focus:ring-primary-brand focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lon" className="text-dark-brand">Longitude *</Label>
              <Input
                id="lon"
                type="number"
                step="any"
                placeholder="31.276793"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                disabled={isLoading}
                required
                className="focus:ring-2 focus:ring-primary-brand focus:border-transparent"
              />
            </div>
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
            disabled={isLoading || isFetchingFpIds || !selectedFile || !fpId || !lat || !lon}
            className={`w-full ${
              isLoading || isFetchingFpIds || !selectedFile || !fpId || !lat || !lon
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