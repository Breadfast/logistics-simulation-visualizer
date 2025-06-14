
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface SimulationSelectorProps {
  selectedSimulation: number | null;
  onSimulationChange: (simulationId: number) => void;
}

const SimulationSelector: React.FC<SimulationSelectorProps> = ({
  selectedSimulation,
  onSimulationChange,
}) => {
  // Mock simulations - replace with actual API call
  const simulations = [
    { id: 1, name: 'Simulation 1 - Morning Rush' },
    { id: 2, name: 'Simulation 2 - Evening Peak' },
    { id: 3, name: 'Simulation 3 - Weekend Traffic' },
    { id: 4, name: 'Simulation 4 - Holiday Schedule' },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Simulation</label>
        <Select
          value={selectedSimulation?.toString() || ''}
          onValueChange={(value) => onSimulationChange(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a simulation..." />
          </SelectTrigger>
          <SelectContent>
            {simulations.map((simulation) => (
              <SelectItem key={simulation.id} value={simulation.id.toString()}>
                {simulation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default SimulationSelector;
