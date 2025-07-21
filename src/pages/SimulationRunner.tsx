import React, { useEffect, useState } from "react";
import {
  fetchSimulationSettings,
  fetchDatasets,
  createSimulationJob,
  fetchSimulationJobs,
  checkSimulationJobRunning,
} from "@/config/api";
import { SimulationSettings, SimulationJobRecord } from "@/types/simulation";
import { Dataset } from "@/types/dataset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const SimulationRunner: React.FC = () => {
  const [settings, setSettings] = useState<SimulationSettings>({});
  const [customSettings, setCustomSettings] = useState<SimulationSettings>({});
  const [useDefault, setUseDefault] = useState(true);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [jobs, setJobs] = useState<SimulationJobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [solver, setSolver] = useState<'lo' | 'in'>('lo');

  // Convert setting key to proper case
  const formatSettingKey = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get input type based on value
  const getInputType = (value: any): string => {
    if (typeof value === 'boolean') return 'checkbox';
    if (typeof value === 'number') return 'number';
    return 'text';
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 hover:no-underline hover:bg-transparent";
    
    switch (status) {
      case 'pending':
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-100`}>
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'running':
        return (
          <Badge className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-100`}>
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case 'completed':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-success-brand border border-green-300 hover:bg-green-100`}>
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-700 border border-red-300 hover:bg-red-100`}>
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-100`}>
            {status}
          </Badge>
        );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, datasetsData, jobsData] = await Promise.all([
        fetchSimulationSettings(),
        fetchDatasets(),
        fetchSimulationJobs(),
      ]);
      setSettings(settingsData);
      setCustomSettings(settingsData);
      setDatasets(datasetsData);
      setJobs(jobsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDataset) {
      setError('Please select a dataset');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Check if simulation is already running
      const runningCheck = await checkSimulationJobRunning();
      if (runningCheck.running) {
        setError('A simulation is already running. Please wait for it to finish.');
        return;
      }

      const settingsToUse = useDefault ? { solver } : { ...customSettings, solver };
      await createSimulationJob({
        dataset_id: selectedDataset,
        settings: settingsToUse,
      });

      setSuccess('Simulation job created successfully!');
      setSelectedDataset(null);
      setUseDefault(true);
      setCustomSettings(settings);
      
      // Refresh jobs list
      const updatedJobs = await fetchSimulationJobs();
      setJobs(updatedJobs);
    } catch (err: any) {
      setError(err.message || 'Failed to create simulation job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-brand" />
          <p className="text-dark-brand">Loading simulation configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-brand mb-2">Simulation Runner</h1>
        <p className="text-secondary-brand">Configure and run route optimization simulations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-dark-brand flex items-center gap-2">
              <Play className="h-5 w-5 text-primary-brand" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Settings Toggle */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="useDefault"
                  name="settingsMode"
                  checked={useDefault}
                  onChange={() => setUseDefault(true)}
                  className="w-4 h-4"
                  style={{ accentColor: '#AA0082' }}
                />
                <label htmlFor="useDefault" className="text-dark-brand font-medium">
                  Use Default Settings
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="useCustom"
                  name="settingsMode"
                  checked={!useDefault}
                  onChange={() => setUseDefault(false)}
                  className="w-4 h-4"
                  style={{ accentColor: '#AA0082' }}
                />
                <label htmlFor="useCustom" className="text-dark-brand font-medium">
                  Custom Settings
                </label>
              </div>
            </div>

            {/* Settings Display/Edit */}
            {useDefault ? (
              <div className="space-y-3">
                <h3 className="font-medium text-dark-brand">Current Settings:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-dark-brand font-medium">{formatSettingKey(key)}</span>
                      <span className="text-success-brand font-mono text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium text-dark-brand">Custom Settings:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(settings).map(([key, defaultValue]) => {
                    const inputType = getInputType(defaultValue);
                    return (
                      <div key={key} className="space-y-2">
                        <label className="text-dark-brand font-medium text-sm flex items-center gap-3">
                          {inputType === 'checkbox' ? (
                            <>
                              <input
                                type="checkbox"
                                checked={customSettings[key] as boolean}
                                onChange={(e) => setCustomSettings(prev => ({
                                  ...prev,
                                  [key]: e.target.checked
                                }))}
                                className="form-checkbox h-5 w-5 text-primary-brand border-gray-300 focus:ring-primary-brand mr-2"
                                style={{ accentColor: '#AA0082' }}
                              />
                              <span>{formatSettingKey(key)}</span>
                            </>
                          ) : (
                            <>
                              {formatSettingKey(key)}
                            </>
                          )}
                        </label>
                        {inputType !== 'checkbox' && (
                          <input
                            type={inputType}
                            value={customSettings[key] as string}
                            onChange={(e) => setCustomSettings(prev => ({
                              ...prev,
                              [key]: inputType === 'number' ? Number(e.target.value) : e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-transparent"
                            placeholder={String(defaultValue)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Solver Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-dark-brand">Select Solver:</h3>
              <select
                value={solver}
                onChange={e => setSolver(e.target.value as 'lo' | 'in')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-transparent"
              >
                <option value="lo">LO API (Production)</option>
                <option value="in">IN API (Internal/Dev)</option>
              </select>
            </div>

            <Separator />

            {/* Dataset Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-dark-brand">Select Dataset:</h3>
              <select
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-transparent"
              >
                <option value="">Choose a dataset...</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.orders_count} orders)
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedDataset}
              className={`w-full py-3 font-medium ${
                submitting || !selectedDataset 
                  ? 'bg-secondary-brand text-white' 
                  : 'bg-primary-brand hover:bg-primary-brand/90 text-white'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Simulation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>

            {/* Alerts */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-success-brand" />
                <AlertDescription className="text-success-brand">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Job History Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-dark-brand">
              Recent Simulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-secondary-brand text-center py-8">No simulation jobs yet</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <span className="text-dark-brand font-medium">
                          Job #{job.id}
                        </span>
                      </div>
                      <span className="text-secondary-brand text-sm">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-brand">Dataset:</span>
                        <span className="text-dark-brand font-medium">
                          {datasets.find(d => d.id === job.dataset_id)?.name || `ID: ${job.dataset_id}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-brand">Settings:</span>
                        <span className="text-success-brand font-medium">
                          {Object.keys(job.settings).length === 0 ? 'Default' : 'Custom'}
                        </span>
                      </div>
                      {job.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                          {job.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimulationRunner; 