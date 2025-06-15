
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface TimelineHeaderProps {
  eventCount: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ eventCount }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Clock className="h-5 w-5 text-blue-500" />
      <h3 className="text-lg font-semibold">Timeline View</h3>
      <Badge variant="secondary">{eventCount} events</Badge>
    </div>
  );
};

export default TimelineHeader;
