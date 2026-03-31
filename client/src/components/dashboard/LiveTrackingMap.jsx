import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Loader2, X, MapPin, Truck } from 'lucide-react';

const containerStyle = { width: '100%', height: '100%' };

// Mock Coordinates somewhere in a city
const defaultCenter = { lat: 28.6139, lng: 77.2090 };
const mockFarmerCoords = { lat: 28.6139, lng: 77.2090 };
const mockBuyerCoords = { lat: 28.6350, lng: 77.2250 }; // roughly a few km away

const LiveTrackingMap = ({ order, onClose }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [directions, setDirections] = useState(null);
  const [truckPosition, setTruckPosition] = useState(mockFarmerCoords);
  const [pathSteps, setPathSteps] = useState([]);
  const animationRef = useRef(null);

  // 1. Fetch Directions Route
  useEffect(() => {
    if (!isLoaded) return;
    
    // Safety check if maps wasn't loaded due to API key errors, though `@react-google-maps/api` still loads a dev map.
    if (!window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: mockFarmerCoords,
        destination: mockBuyerCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Extract the polyline points to animate the truck
          const route = result.routes[0].overview_path;
          const points = route.map(p => ({ lat: p.lat(), lng: p.lng() }));
          setPathSteps(points);
        } else {
          console.error(`Directions request failed: status ${status}`);
        }
      }
    );
  }, [isLoaded]);

  // 2. Animate Truck
  useEffect(() => {
    if (pathSteps.length === 0) return;

    let idx = 0;
    // We update position every 500ms to instantly simulate moving down the road
    const interval = setInterval(() => {
      idx = (idx + 1) % pathSteps.length;
      setTruckPosition(pathSteps[idx]);
    }, 1000);

    return () => clearInterval(interval);
  }, [pathSteps]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300">
       <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden relative flex flex-col h-[85vh]">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center shrink-0 z-10 relative shadow-sm">
             <div>
               <h3 className="text-2xl font-bold flex items-center text-gray-900">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Live Delivery Tracking
               </h3>
               <p className="text-gray-500 text-sm mt-1 flex items-center">
                  Order <code className="mx-1 px-1 bg-gray-100 rounded text-primary-600">#{order._id.slice(-6).toUpperCase()}</code> is on the way to you!
               </p>
             </div>
             <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-colors cursor-pointer border border-gray-200">
                 <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 relative bg-gray-100">
             {!isLoaded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
                   <p className="text-gray-500 font-medium">Initializing GPS Network...</p>
                </div>
             ) : (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={14}
                  options={{
                    disableDefaultUI: true, // cleaner look
                    zoomControl: true,
                  }}
                >
                  {directions && (
                    <DirectionsRenderer 
                      directions={directions} 
                      options={{
                          suppressMarkers: true, // We will draw our own animated markers
                          polylineOptions: { strokeColor: '#3b82f6', strokeWeight: 5, strokeOpacity: 0.8 }
                      }}
                    />
                  )}

                  {/* Origin Marker (Farmer) */}
                  <Marker 
                     position={mockFarmerCoords} 
                     label={{ text: "A", color: "white", fontWeight: "bold" }}
                  />
                  
                  {/* Destination Marker (Buyer) */}
                  <Marker 
                     position={mockBuyerCoords} 
                     label={{ text: "B", color: "white", fontWeight: "bold" }}
                  />

                  {/* Animated Truck Marker */}
                  {pathSteps.length > 0 && (
                      <Marker 
                        position={truckPosition} 
                        icon={window.google && {
                           path: window.google.maps.SymbolPath.CIRCLE,
                           scale: 10,
                           fillColor: "#22c55e",
                           fillOpacity: 1,
                           strokeWeight: 2,
                           strokeColor: "#ffffff",
                        }}
                      />
                  )}
                </GoogleMap>
             )}
          </div>
          
          <div className="bg-white p-6 border-t border-gray-100 shrink-0 flex items-center justify-between">
             <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                   <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-900">Delivery Vehicle #402</p>
                   <p className="text-xs text-gray-500">Driver is approaching</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ETA</p>
                <p className="text-xl font-black text-gray-900">12 Mins</p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default LiveTrackingMap;
