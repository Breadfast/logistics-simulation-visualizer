import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatasetImportForm from '@/components/DatasetImportForm';
import DatasetsList from '@/components/DatasetsList';

const Datasets = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark-brand">Dataset Management</h1>
        <p className="text-secondary-brand mt-2">
          Import and manage datasets for route optimization simulations
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger 
            value="import" 
            className="data-[state=active]:bg-primary-brand data-[state=active]:text-white"
          >
            Import Dataset
          </TabsTrigger>
          <TabsTrigger 
            value="manage" 
            className="data-[state=active]:bg-primary-brand data-[state=active]:text-white"
          >
            Manage Datasets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <div className="flex justify-center">
            <DatasetImportForm />
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <DatasetsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Datasets; 