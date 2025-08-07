import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map, Database, Users, PlayCircle } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/Breadfast logo.png" 
                alt="Breadfast Logo" 
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              
              <Link to="/datasets">
                <Button
                  variant={location.pathname === '/datasets' ? 'default' : 'ghost'}
                  className={`flex items-center gap-2 ${
                    location.pathname === '/datasets' 
                      ? 'bg-primary-brand hover:bg-primary-brand/90 text-white' 
                      : 'text-dark-brand hover:text-primary-brand hover:bg-gray-50'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  Datasets
                </Button>
              </Link>

              {/* <Link to="/drivers">
                <Button
                  variant={location.pathname === '/drivers' ? 'default' : 'ghost'}
                  className={`flex items-center gap-2 ${
                    location.pathname === '/drivers' 
                      ? 'bg-primary-brand hover:bg-primary-brand/90 text-white' 
                      : 'text-dark-brand hover:text-primary-brand hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Drivers
                </Button>
              </Link> */}

              <Link to="/simulation">
                <Button
                  variant={location.pathname === '/simulation' ? 'default' : 'ghost'}
                  className={`flex items-center gap-2 ${
                    location.pathname === '/simulation' 
                      ? 'bg-primary-brand hover:bg-primary-brand/90 text-white' 
                      : 'text-dark-brand hover:text-primary-brand hover:bg-gray-50'
                  }`}
                >
                  <PlayCircle className="h-4 w-4" />
                  Simulation
                </Button>
              </Link>
              <Link to="/">
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  className={`flex items-center gap-2 ${
                    location.pathname === '/' 
                      ? 'bg-primary-brand hover:bg-primary-brand/90 text-white' 
                      : 'text-dark-brand hover:text-primary-brand hover:bg-gray-50'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Visualization
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 