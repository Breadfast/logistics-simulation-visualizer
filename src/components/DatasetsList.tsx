import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Trash2, RefreshCw } from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import { Dataset } from '@/types/dataset';
import { useNavigate } from 'react-router-dom';
import { Badge as StatusBadge } from '@/components/ui/badge';

interface DatasetsListProps {
  onDatasetSelect?: (dataset: Dataset) => void;
  onRefresh?: () => void;
}

const DatasetsList: React.FC<DatasetsListProps> = ({ onDatasetSelect, onRefresh }) => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDatasets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildApiUrl('/datasets'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }
      
      const data = await response.json();
      setDatasets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets');
      setDatasets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDataset = async (datasetId: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }
    setDeletingId(datasetId);
    try {
      const response = await fetch(buildApiUrl(`/datasets/${datasetId}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dataset');
      }

      // Remove from local state
      setDatasets(prev => prev.filter(d => d.id !== datasetId));
    } catch (err) {
      console.error('Error deleting dataset:', err);
      alert('Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleRefresh = () => {
    fetchDatasets();
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-brand" />
            <CardTitle className="text-dark-brand">Datasets</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-gray-300 text-dark-brand hover:bg-gray-50 hover:text-primary-brand"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-secondary-brand">
          Available datasets for route optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-brand" />
            <span className="ml-2 text-dark-brand">Loading datasets...</span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-8 text-secondary-brand">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No datasets available</p>
            <p className="text-sm">Import a dataset to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-dark-brand">{dataset.name}</h4>
                    <Badge variant="secondary" className="bg-gray-100 text-secondary-brand border border-gray-300">
                      ID: {dataset.id}
                    </Badge>
                    {dataset.status && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border border-blue-300">
                        Status: {dataset.status}
                      </Badge>
                    )}
                    {dataset.drivers_count > 0 ? (
                      <StatusBadge className="bg-green-100 text-green-700 border border-green-300">Has Drivers</StatusBadge>
                    ) : (
                      <StatusBadge className="bg-yellow-100 text-yellow-700 border border-yellow-300">No Drivers</StatusBadge>
                    )}
                  </div>
                  <div className="text-sm text-secondary-brand mt-1">
                    Created: {new Date(dataset.created_at).toLocaleDateString()}
                    {dataset.orders_count && (
                      <span className="ml-2">
                        • {dataset.orders_count} orders
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onDatasetSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDatasetSelect(dataset)}
                      className="border-primary-brand text-primary-brand hover:bg-primary-brand hover:text-white"
                    >
                      Select
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/datasets/${dataset.id}/upload-drivers`)}
                    className="border-primary-brand text-primary-brand hover:bg-primary-brand hover:text-white"
                  >
                    Upload Drivers
                  </Button>
                  {dataset.drivers_count > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/datasets/${dataset.id}/drivers`)}
                      className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-900"
                    >
                      View Drivers
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDataset(dataset.id)}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                    disabled={deletingId === dataset.id}
                  >
                    {deletingId === dataset.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetsList; 