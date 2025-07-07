import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationSearchProps {
  placeholder: string;
  onLocationSelect: (location: Location) => void;
  className?: string;
  icon?: React.ReactNode;
}

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  placeholder, 
  onLocationSelect, 
  className,
  icon
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Function to format location name for display in the dropdown
  const formatLocationName = (display_name: string): string => {
    // Split the address by commas
    const parts = display_name.split(',');
    
    // For shorter addresses, just return the first part
    if (parts.length <= 3) return parts[0].trim();
    
    // For longer addresses, return City, State or equivalent
    if (parts.length > 2) {
      return `${parts[0].trim()}, ${parts[parts.length - 3].trim()}`;
    }
    
    // Fallback to just the first part
    return parts[0].trim();
  };

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // Use Nominatim API for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching for location:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    
    // Debounce search requests
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const handleSelectLocation = (result: SearchResult) => {
    const location: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    };
    
    // Set the query to a shortened version of the display name
    const formattedName = formatLocationName(result.display_name);
    setQuery(formattedName);
    
    onLocationSelect(location);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 h-5 w-5 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onClick={() => query && setShowResults(true)}
          placeholder={placeholder}
          className={`w-full h-12 ${icon ? 'pl-10' : ''}`}
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            &times;
          </Button>
        )}
      </div>
      
      {showResults && (
        <Command className="absolute w-full z-[9999] top-full mt-1 rounded-md border shadow-xl bg-popover max-h-96 overflow-visible">
          <CommandList className="max-h-[350px] overflow-auto py-2">
            {loading ? (
              <CommandEmpty className="py-6">Searching...</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty className="py-6">No locations found</CommandEmpty>
            ) : (
              <CommandGroup className="overflow-visible">
                {results.map((result) => (
                  <CommandItem
                    key={result.place_id}
                    onSelect={() => handleSelectLocation(result)}
                    className="cursor-pointer py-3 px-3 hover:bg-accent/80 flex items-center"
                    value={result.display_name}
                  >
                    <div className="flex items-center w-full space-x-2">
                      <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatLocationName(result.display_name)}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {result.display_name}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      )}
    </div>
  );
};

export default LocationSearch;