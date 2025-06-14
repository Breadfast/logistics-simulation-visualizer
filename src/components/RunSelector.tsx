
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface RunSelectorProps {
  selectedRun: number | null;
  onRunChange: (runId: number) => void;
}

const RunSelector: React.FC<RunSelectorProps> = ({
  selectedRun,
  onRunChange,
}) => {
  // Mock runs - replace with actual API call
  const runs = [
    { id: 1, name: 'Run 1 - Morning Rush' },
    { id: 2, name: 'Run 2 - Evening Peak' },
    { id: 3, name: 'Run 3 - Weekend Traffic' },
    { id: 4, name: 'Run 4 - Holiday Schedule' },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Run</label>
        <Select
          value={selectedRun?.toString() || ''}
          onValueChange={(value) => onRunChange(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a run..." />
          </SelectTrigger>
          <SelectContent>
            {runs.map((run) => (
              <SelectItem key={run.id} value={run.id.toString()}>
                {run.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default RunSelector;
