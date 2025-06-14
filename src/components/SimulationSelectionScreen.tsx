
import React from 'react';
import SimulationSelector from './SimulationSelector';

interface SimulationSelectionScreenProps {
  selectedSimulation: number | null;
  onSimulationChange: (simulationId: number) => void;
}

const SimulationSelectionScreen: React.FC<SimulationSelectionScreenProps> = ({
  selectedSimulation,
  onSimulationChange,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <SimulationSelector
          selectedSimulation={selectedSimulation}
          onSimulationChange={onSimulationChange}
        />
      </div>
    </div>
  );
};

export default SimulationSelectionScreen;
