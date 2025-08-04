import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { buildApiUrl } from '@/config/api';

interface Driver {
  id: number;
  fp_id: string;
  // Add other driver fields as needed
}

interface DriverCheckin {
  id: number;
  driver_id: number;
  checkin_time: string;
}

const DatasetDrivers: React.FC = () => {
  const { id } = useParams();
  const datasetId = Number(id);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [checkins, setCheckins] = useState<DriverCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Drivers & Checkins for Dataset {datasetId}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>FP ID</TableHead>
                    <TableHead>Checkins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map(driver => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.id}</TableCell>
                      <TableCell>{driver.fp_id}</TableCell>
                      <TableCell>
                        {checkins
                          .filter(c => c.driver_id === driver.id)
                          .map(c => new Date(c.checkin_time).toLocaleString())
                          .join(', ') || 'None'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetDrivers;
