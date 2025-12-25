import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Navigation, AlertCircle } from 'lucide-react';

const EmergencyHospitalLocator = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [caseId, setCaseId] = useState('');
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Sample hospitals with coordinates
  const hospitals = [
    { id: 1, name: "City General Hospital", lat: 13.0827, lng: 80.2707, phone: "+91-44-2345-6789", services: "Emergency, Trauma, ICU" },
    { id: 2, name: "Apollo Emergency Care", lat: 13.0569, lng: 80.2425, phone: "+91-44-2876-5432", services: "24/7 Emergency, Cardiac Care" },
    { id: 3, name: "St. Mary's Medical Center", lat: 13.0675, lng: 80.2345, phone: "+91-44-2654-3210", services: "Emergency, Pediatrics" },
    { id: 4, name: "Metro Healthcare", lat: 13.0912, lng: 80.2543, phone: "+91-44-2987-6543", services: "Multi-specialty Emergency" },
    { id: 5, name: "Lifeline Hospital", lat: 13.0445, lng: 80.2567, phone: "+91-44-2123-4567", services: "Emergency, Surgery" },
    { id: 6, name: "Sunrise Medical", lat: 13.0734, lng: 80.2189, phone: "+91-44-2456-7890", services: "24/7 Emergency Care" }
  ];

  const generateCaseId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EMG-${timestamp}-${random}`;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateETA = (distance) => {
    const avgSpeed = 40; // km/h in emergency
    const timeInHours = distance / avgSpeed;
    const minutes = Math.round(timeInHours * 60);
    return minutes;
  };

  const findNearbyHospitals = (userLat, userLng) => {
    const radius = 15; // km
    const hospitalsWithDistance = hospitals.map(hospital => {
      const distance = calculateDistance(userLat, userLng, hospital.lat, hospital.lng);
      const eta = calculateETA(distance);
      return { ...hospital, distance: distance.toFixed(2), eta };
    });

    const nearby = hospitalsWithDistance
      .filter(h => h.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  };

  const handleEmergency = () => {
    setLoading(true);
    
    // Try to get actual user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const id = generateCaseId();
          setCaseId(id);
          const nearby = findNearbyHospitals(latitude, longitude);
          setNearbyHospitals(nearby);
          setLoading(false);
        },
        (error) => {
          // Fallback to demo location (Chennai area)
          const demoLat = 13.0675;
          const demoLng = 80.2345;
          setUserLocation({ lat: demoLat, lng: demoLng });
          const id = generateCaseId();
          setCaseId(id);
          const nearby = findNearbyHospitals(demoLat, demoLng);
          setNearbyHospitals(nearby);
          setLoading(false);
        }
      );
    } else {
      // Fallback if geolocation not supported
      const demoLat = 13.0675;
      const demoLng = 80.2345;
      setUserLocation({ lat: demoLat, lng: demoLng });
      const id = generateCaseId();
      setCaseId(id);
      const nearby = findNearbyHospitals(demoLat, demoLng);
      setNearbyHospitals(nearby);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-600 w-8 h-8" />
            <h1 className="text-3xl font-bold text-gray-800">Emergency Hospital Locator</h1>
          </div>
          <p className="text-gray-600">Quick access to nearest hospitals during emergencies</p>
        </div>

        {/* Emergency Button */}
        {!caseId && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <button
              onClick={handleEmergency}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Locating Hospitals...' : '🚨 FIND NEAREST HOSPITAL'}
            </button>
            <p className="text-gray-500 mt-4 text-sm">Click to activate emergency mode</p>
          </div>
        )}

        {/* Case ID Display */}
        {caseId && (
          <div className="bg-green-100 border-2 border-green-600 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-semibold">Emergency Case ID</p>
                <p className="text-2xl font-bold text-green-900">{caseId}</p>
              </div>
              <button
                onClick={handleEmergency}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Hospital List */}
        {nearbyHospitals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Nearby Hospitals ({nearbyHospitals.length} found)
            </h2>
            {nearbyHospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
                  index === 0 ? 'border-green-500' : 'border-blue-500'
                } hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {index === 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          CLOSEST
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-800">{hospital.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{hospital.services}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="font-bold">{hospital.distance} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="font-bold">{hospital.eta} mins</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="font-bold text-sm">{hospital.phone}</p>
                    </div>
                  </div>
                </div>

                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyHospitalLocator;