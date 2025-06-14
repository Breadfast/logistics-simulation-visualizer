
import React from 'react';
import RunSelector from './RunSelector';

interface RunSelectionScreenProps {
  selectedRun: number | null;
  onRunChange: (runId: number) => void;
}

const RunSelectionScreen: React.FC<RunSelectionScreenProps> = ({
  selectedRun,
  onRunChange,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <RunSelector
          selectedRun={selectedRun}
          onRunChange={onRunChange}
        />
      </div>
    </div>
  );
};

export default RunSelectionScreen;
