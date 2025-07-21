import React from 'react';
import DriverImportForm from '../components/DriverImportForm';

const Drivers: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <DriverImportForm />
    </div>
  );
};

export default Drivers; 