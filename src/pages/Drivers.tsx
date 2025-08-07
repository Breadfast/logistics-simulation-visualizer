import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Clock, User, MapPin, Users, Activity, Calendar } from 'lucide-react';
import { buildApiUrl } from '@/config/api';

interface Driver {
  id: number;
  hr_id: number;
  fulfilment_point: string;
  // Add other driver fields as needed
}

interface DriverCheckin {
  id: number;
  driver_id: number;
  checkin_time: string;
}

interface TimeSlot {
  time: string;
  formattedTime: string;
  date: string;
  drivers: Driver[];
}

const DatasetDrivers: React.FC = () => {
  const { id } = useParams();
  const datasetId = Number(id);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [checkins, setCheckins] = useState<DriverCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const driversRes = await fetch(buildApiUrl(`/drivers?dataset_id=${datasetId}`));
        if (!driversRes.ok) throw new Error('Failed to fetch drivers');
        const driversData = await driversRes.json();
        setDrivers(driversData);
        // Fetch all checkins for these drivers
        const driverIds = driversData.map((d: Driver) => d.id);
        if (driverIds.length > 0) {
          const checkinsRes = await fetch(buildApiUrl(`/driver_checkins?driver_ids=${driverIds.join(',')}`));
          if (!checkinsRes.ok) throw new Error('Failed to fetch checkins');
          setCheckins(await checkinsRes.json());
        } else {
          setCheckins([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    if (datasetId) fetchData();
  }, [datasetId]);

  const formatCheckinTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeOnly = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateOnly = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create time slots matrix
  const timeSlots = useMemo(() => {
    if (!checkins.length) return [];

    // Group checkins by time (rounded to nearest 5 minutes for better grouping)
    const timeGroups = new Map<string, DriverCheckin[]>();
    
    checkins.forEach(checkin => {
      const date = new Date(checkin.checkin_time);
      // Round to nearest 5 minutes
      const roundedMinutes = Math.round(date.getMinutes() / 5) * 5;
      const roundedDate = new Date(date);
      roundedDate.setMinutes(roundedMinutes, 0, 0);
      const timeKey = roundedDate.toISOString();
      
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)!.push(checkin);
    });

    // Convert to array and sort by time
    return Array.from(timeGroups.entries())
      .map(([timeKey, checkins]) => {
        const date = new Date(timeKey);
        const driverIds = checkins.map(c => c.driver_id);
        const driversInSlot = drivers.filter(d => driverIds.includes(d.id));
        
        return {
          time: timeKey,
          formattedTime: formatTimeOnly(timeKey),
          date: formatDateOnly(timeKey),
          drivers: driversInSlot,
          checkinCount: checkins.length
        };
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [checkins, drivers]);

  // Get driver checkins for list view
  const getDriverCheckins = (driverId: number) => {
    return checkins
      .filter(c => c.driver_id === driverId)
      .sort((a, b) => new Date(b.checkin_time).getTime() - new Date(a.checkin_time).getTime());
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brand mx-auto mb-4"></div>
            <p className="text-gray-600">Loading drivers and checkins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Data</div>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary-brand" />
            <h1 className="text-3xl font-bold text-gray-900">Drivers & Checkins</h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Dataset {datasetId}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('matrix')}
            >
              Matrix View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Drivers</p>
                  <p className="text-2xl font-bold text-blue-800">{drivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Checkins</p>
                  <p className="text-2xl font-bold text-green-800">{checkins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Time Slots</p>
                  <p className="text-2xl font-bold text-purple-800">{timeSlots.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Active Drivers</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {drivers.filter(d => getDriverCheckins(d.id).length > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Checkin Time Matrix
            </CardTitle>
            <p className="text-sm text-gray-600">
              Shows when drivers check in. Multiple drivers can check in at the same time slot.
            </p>
          </CardHeader>
          <CardContent>
            {timeSlots.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Driver</TableHead>
                      {timeSlots.map((slot, index) => (
                        <TableHead key={slot.time} className="text-center min-w-32">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-sm">{slot.formattedTime}</span>
                            <span className="text-xs text-gray-500">{slot.date}</span>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {slot.checkinCount}
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map(driver => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <div>
                              <div>Driver {driver.hr_id}</div>
                              <div className="text-xs text-gray-500">{driver.fulfilment_point}</div>
                            </div>
                          </div>
                        </TableCell>
                        {timeSlots.map(slot => {
                          const isCheckedIn = slot.drivers.some(d => d.id === driver.id);
                          return (
                            <TableCell key={slot.time} className="text-center">
                              {isCheckedIn ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-3 h-3 bg-gray-200 rounded-full mx-auto"></div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Checkins Found</h3>
                <p className="text-gray-500">No checkins are available for this dataset.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drivers.map(driver => {
            const driverCheckins = getDriverCheckins(driver.id);
            const hasCheckins = driverCheckins.length > 0;
            
            return (
              <Card 
                key={driver.id} 
                className={`transition-all duration-200 hover:shadow-lg ${
                  hasCheckins ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${hasCheckins ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-600" />
                          Driver {driver.hr_id}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{driver.fulfilment_point}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant={hasCheckins ? "default" : "secondary"} className="text-xs">
                      {driverCheckins.length} checkin{driverCheckins.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>

                {hasCheckins && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Checkin Times
                      </h4>
                      {driverCheckins.map((checkin, index) => (
                        <div 
                          key={checkin.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            index === 0 
                              ? 'bg-green-100 border-green-200' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              index === 0 ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatCheckinTime(checkin.checkin_time)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Checkin #{checkin.id}
                              </p>
                            </div>
                          </div>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}

                {!hasCheckins && (
                  <CardContent className="pt-0">
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No checkins recorded</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {drivers.length === 0 && (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Drivers Found</h3>
          <p className="text-gray-500">No drivers are available for this dataset.</p>
        </Card>
      )}
    </div>
  );
};

export default DatasetDrivers;
