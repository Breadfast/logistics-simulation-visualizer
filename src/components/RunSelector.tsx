
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import { Run } from '@/types/run';

interface RunSelectorProps {
  selectedRun: number | null;
  onRunChange: (runId: number) => void;
}

const RunSelector: React.FC<RunSelectorProps> = ({
  selectedRun,
  onRunChange,
}) => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildApiUrl('/runs'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch runs');
      }
      
      const data = await response.json();
      setRuns(data.runs || data || []);
    } catch (err) {
      console.error('Error fetching runs:', err);
      setError('Failed to load runs');
      // Fallback to empty array if API fails
      setRuns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const getRunDisplayName = (run: Run) => {
    return run.name || `Run ${run.id} (${new Date(run.created_at).toLocaleDateString()})`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Run</label>
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <Select
          value={selectedRun?.toString() || ''}
          onValueChange={(value) => onRunChange(parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Loading runs..." : "Choose a run..."} />
          </SelectTrigger>
          <SelectContent>
            {runs.map((run) => (
              <SelectItem key={run.id} value={run.id.toString()}>
                {getRunDisplayName(run)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading runs...</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RunSelector;
