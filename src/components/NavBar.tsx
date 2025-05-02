/* eslint-disable @typescript-eslint/no-unused-expressions */
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Map, Search, Layers, Navigation, Menu, User, Home, BookMarked, 
  Settings, Bell, LocateFixed, Plus, Minus, Compass, X, 
  Flag, Coffee, Star, MapPin, ChevronRight, Share2, Download,
  Info, Ruler, Zap, Route, Clock, Heart, Filter,
  Sun, Moon, Circle, Square
} from 'lucide-react';
import * as turf from '@turf/turf';
import { useState, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { bhutanGeoJSON } from './bhutan.geojson';
import { useNavigate,useLocation  } from 'react-router-dom';


// Leaflet type extensions
declare module 'leaflet' {
  interface RoutingControl {
    getWaypoints(): L.LatLng[];
    setWaypoints(waypoints: L.LatLng[]): void;
    remove(): void;
  }
}
//  Leaflet marker icons
 
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



export default function MapNavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState('map');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocationEnabled, setUserLocationEnabled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showRoutingOptions, setShowRoutingOptions] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  //Map
  const [map, setMap] = useState<L.Map | null>(null);
  const [routingControl, setRoutingControl] = useState<L.Routing.Control | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [currentLayer, setCurrentLayer] = useState<L.TileLayer>();
  //rulers and measurement
  const [isMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const measureLineRef = useRef<L.Polyline | null>(null);
  const measureMarkersRef = useRef<L.Marker[]>([]);
  
  const [drawingMode, setDrawingMode] = useState<'measure' | 'polygon' | 'circle' | 'rectangle' | null>(null);
  
  const [measurementResult, setMeasurementResult] = useState<string>('');
  const [drawingPoints, setDrawingPoints] = useState<L.LatLng[]>([]);
  const [measureType, setMeasureType] = useState<'distance' | 'area'>('distance');
  
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [startCoords, setStartCoords] = useState<L.LatLng | null>(null);
  const [endCoords, setEndCoords] = useState<L.LatLng | null>(null);
  const [selectedPointType, setSelectedPointType] = useState<'start' | 'end' | null>(null);
  
  const drawnItems = useRef(L.featureGroup());
  const tempShapeRef = useRef<L.Layer | null>(null);
  const [choroplethLayer, setChoroplethLayer] = useState<L.GeoJSON>();

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    osm: true,
    satellite: false,
    dark: false,
    transport: false,
    terrain: false,
    traffic: false,
    choropleth: true 
  });




useEffect(() => {
  const path = location.pathname;
  if (path === '/about') {
    setActiveTab('about');
  } else if (path === '/') {
    setActiveTab('map');
  }
}, [location]);


useEffect(() => {
  const path = location.pathname;
  if (path === '/about') {
    setActiveTab('about');
  } else if (path === '/') {
    setActiveTab('map');
  }
}, [location.pathname]); // Fix: Use location.pathname instead of location






  //submit handler
const handleRouteSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const start = await geocodeAddress(startPoint);
  const end = await geocodeAddress(endPoint);
  
  if (start && end) {
    setStartCoords(start);
    setEndCoords(end);
  } else {
    alert('Could not find one or both locations');
  }
};
//geo coding
const geocodeAddress = async (address: string): Promise<L.LatLng | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'MapExplorer/1.0' } }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return data.length > 0 
      ? new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon))
      : null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

//layers

// eslint-disable-next-line no-empty-pattern
const [] = useState<Record<string, L.TileLayer>>({
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
  }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors, © CARTO'
  }),
  transport: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
  }),
  terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors, SRTM | Style: © OpenTopoMap (CC-BY-SA)'
  }),
  traffic: L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap France | © OpenStreetMap contributors'
  })
});
//handle route
useEffect(() => {
  if (!map || !routingControl) return;

  const handleRoutesFound = (e: any) => {
    const routes = e.routes;
    if (routes && routes.length > 0) {
      const bounds = routes[0].coordinates.reduce(
        (acc: L.LatLngBounds, coord: L.LatLng) => acc.extend(coord),
        L.latLngBounds(routes[0].coordinates)
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  routingControl.on('routesfound', handleRoutesFound);
  return () => {
    // Remove event listener with type assertion
    if (routingControl) {
      (routingControl as any).off('routesfound', handleRoutesFound);
    }
  };
}, [routingControl, map]);

//routing control iniziliation
useEffect(() => {
  if (!map || !showRoutingOptions || !startCoords || !endCoords) return;

  
  if (routingControl) {
    routingControl.remove();
  }

  const control = L.Routing.control({
    waypoints: [startCoords, endCoords],
    routeWhileDragging: true,
    show: true,
    collapsible: true,
    fitSelectedRoutes: 'smart',
    lineOptions: {
      styles: [{ color: '#2563eb', opacity: 0.7, weight: 6 }],
      extendToWaypoints: false,
      missingRouteTolerance: 0
    },
    // router configuration
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1'
    })
  }).addTo(map);

  setRoutingControl(control);

  return () => {
    control.remove();
  };
}, [showRoutingOptions, map, startCoords, endCoords, routingControl]);


//class for responsive


// map click handling
useEffect(() => {
  if (!map || !selectedPointType) return;

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      const address = data.display_name || 'Unknown location';
      
      if (selectedPointType === 'start') {
        setStartPoint(address);
        setStartCoords(e.latlng);
      } else {
        setEndPoint(address);
        setEndCoords(e.latlng);
      }
      
      setSelectedPointType(null);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  map.on('click', handleMapClick);
  return () => {
    map.off('click', handleMapClick);
  };
}, [map, selectedPointType]);


//measurement
// useEffect block above your other useEffect hooks
useEffect(() => {
  if (!map || !isMeasuring) return;

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newPoint = e.latlng;
    setMeasurePoints(prev => prev.length >= 2 ? [newPoint] : [...prev, newPoint]);
  };

  map.on('click', handleMapClick);
  return () => { map.off('click', handleMapClick) };
}, [map, isMeasuring]);

// useEffect for drawing measurements
useEffect(() => {
  if (!map || !isMeasuring) return;

  
  measureLineRef.current?.remove();
  measureMarkersRef.current.forEach(marker => marker.remove());
  measureMarkersRef.current = [];

  if (measurePoints.length > 0) {
    // Create markers
    const markers = measurePoints.map((point, index) => {
      const marker = L.marker(point, {
        icon: L.divIcon({
          className: 'measure-marker',
          html: `<div class="${darkMode ? 'dark-measure-marker' : 'light-measure-marker'}">${index + 1}</div>`
        })
      }).addTo(map);
      if (index === 0) marker.bindPopup('Start point').openPopup();
      return marker;
    });
    measureMarkersRef.current = markers;

    // Create line and show distance
    if (measurePoints.length === 2) {
      const line = L.polyline(measurePoints, { 
        color: darkMode ? '#60a5fa' : '#2563eb',
        weight: 2
      }).addTo(map);
      measureLineRef.current = line;
      
      const distance = measurePoints[0].distanceTo(measurePoints[1]);
      const formattedDistance = `${(distance / 1000).toFixed(2)} km`;
      markers[1].bindPopup(`Distance: ${formattedDistance}`).openPopup();
      map.fitBounds(line.getBounds());
    }
  }

  return () => {
    measureLineRef.current?.remove();
    measureMarkersRef.current.forEach(marker => marker.remove());
  };
}, [measurePoints, map, isMeasuring, darkMode]);

//  cleanup effect
useEffect(() => {
  if (!isMeasuring) {
    setMeasurePoints([]);
    measureLineRef.current?.remove();
    measureMarkersRef.current.forEach(marker => marker.remove());
  }
}, [isMeasuring]);

 // Enhanced measurement effects
    useEffect(() => {
      if (!map || !drawingMode) return;
  
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const newPoint = e.latlng;
        
        if (drawingMode === 'measure') {
          if (measureType === 'distance') {
            setDrawingPoints(prev => prev.length >= 2 ? [newPoint] : [...prev, newPoint]);
          } else {
            setDrawingPoints(prev => [...prev, newPoint]);
          }
        } else {
          setDrawingPoints(prev => [...prev, newPoint]);
        }
      };
  
      map.on('click', handleMapClick);
      return () => { map.off('click', handleMapClick) };
    }, [map, drawingMode, measureType]);

    // Handle drawing shapes
        useEffect(() => {
          if (!map || !drawingMode || drawingPoints.length === 0) return;
      
          // Clear previous temporary shape
          if (tempShapeRef.current) {
            map.removeLayer(tempShapeRef.current);
          }
      
          switch (drawingMode) {
            case 'measure':
              if (measureType === 'distance' && drawingPoints.length === 2) {
                const line = L.polyline(drawingPoints, { 
                  color: darkMode ? '#60a5fa' : '#2563eb',
                  weight: 2
                });
                tempShapeRef.current = line.addTo(map);
                
                const distance = drawingPoints[0].distanceTo(drawingPoints[1]);
                setMeasurementResult(`${(distance / 1000).toFixed(2)} km`);
              } 
              else if (measureType === 'area' && drawingPoints.length >= 3) {
                const polygon = L.polygon(drawingPoints.map(p => [p.lat, p.lng]), { 
                  color: darkMode ? '#60a5fa' : '#2563eb',
                  weight: 2,
                  fillOpacity: 0.2
                });
                tempShapeRef.current = polygon.addTo(map);
                
                const area = turf.area(turf.polygon([
                  [...drawingPoints.map(p => [p.lng, p.lat]), [drawingPoints[0].lng, drawingPoints[0].lat]]
                ]));
                setMeasurementResult(`${(area / 1e6).toFixed(2)} km²`);
              }
              break;
      
            case 'polygon':
              { const poly = L.polygon(drawingPoints.map(p => [p.lat, p.lng]), {
                color: '#4f46e5',
                fillOpacity: 0.2
              });
              tempShapeRef.current = poly.addTo(map);
              break; }
      
            case 'circle':
              if (drawingPoints.length === 2) {
                const radius = drawingPoints[0].distanceTo(drawingPoints[1]);
                const circle = L.circle(drawingPoints[0], { radius });
                tempShapeRef.current = circle.addTo(map);
              }
              break;
      
            case 'rectangle':
              if (drawingPoints.length === 2) {
                const bounds = L.latLngBounds(drawingPoints);
                const rect = L.rectangle(bounds, { color: '#4f46e5' });
                tempShapeRef.current = rect.addTo(map);
              }
              break;
          }
      
          return () => {
            if (tempShapeRef.current) {
              map.removeLayer(tempShapeRef.current);
            }
          };
        }, [drawingPoints, map, drawingMode, measureType, darkMode]);
      
        // Finalize shape drawing
        const finalizeDrawing = () => {
          if (tempShapeRef.current) {
            drawnItems.current.addLayer(tempShapeRef.current);
            map?.addLayer(drawnItems.current);
          }
          setDrawingMode(null);
          setDrawingPoints([]);
          tempShapeRef.current = null;
        };
        
        const clearDrawings = () => {
          drawnItems.current.clearLayers();
          setDrawingPoints([]);
          setMeasurementResult('');
          if (tempShapeRef.current) {
            map?.removeLayer(tempShapeRef.current);
          }
        };
  

//geocoding search 
  useEffect(() => {
    if (!map || !searchQuery) return;
  
    const searchGeocode = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'User-Agent': 'MapExplorer/1.0 (your@email.com)',
            },
          }
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };
  
    const debounceTimer = setTimeout(searchGeocode, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, map]);
  

  // track zoom changes
  useEffect(() => {
    if (!map) return;
  
    const updateZoom = () => setZoomLevel(map.getZoom());
    map.on('zoom', updateZoom);
    
    return () => {
      map.off('zoom', updateZoom);
    };
  }, [map]);

  // Initialize Map
   
  useEffect(() => {
    if (!mapContainer.current || map) return;
  
    const initialMap = L.map(mapContainer.current, {
      zoomControl: false,
      doubleClickZoom: 'center' // Enable double-click zoom to center
    }).setView([27.5142, 90.4336], 8);

    // Create choropleth layer
      const choropleth = L.geoJSON(bhutanGeoJSON as never, {
        style: styleFeature,
        onEachFeature: onEachFeature
      });

       // Add to map if active
  if (activeLayers.choropleth) {
    choropleth.addTo(initialMap);
  }
  setChoroplethLayer(choropleth);
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(initialMap);


    
  

   
   // legend control with proper typing
const legend = (L.control as unknown as (options?: L.ControlOptions) => L.Control)({ 
  position: 'bottomright' 
});

legend.onAdd = () => {
  const div = L.DomUtil.create('div', `legend ${darkMode ? 'dark-legend' : ''}`);
  div.innerHTML = `
    <h4 class="text-sm mb-1">Population Density</h4>
    ${[100000, 50000, 20000, 10000, 5000, 1000].map(range => `
      <div class="legend-item">
        <i style="background:${getColor(range + 1)}"></i>
        <span class="text-xs">${range.toLocaleString()}+</span>
      </div>
    `).join('')}
  `;
  return div;
};

legend.addTo(initialMap);

     
    
    setCurrentLayer(osmLayer);
    setMap(initialMap);
  
    return () => {
      initialMap.remove();
    };
  }, []);

  

    // Dark Mode Toggle
      useEffect(() => {
        if (!map) return;
    
        if (darkMode) {
          const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CARTO'
          });
          currentLayer?.remove();
          darkLayer.addTo(map);
          setCurrentLayer(darkLayer);
        } else {
          const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          });
          currentLayer?.remove();
          osmLayer.addTo(map);
          setCurrentLayer(osmLayer);
        }
      }, [darkMode]);

     // User Location
       useEffect(() => {
         if (!map || !userLocationEnabled) return;
     
         map.locate({ setView: true, maxZoom: 16 });
         const onLocationFound = (e: L.LocationEvent) => {
           L.marker(e.latlng).addTo(map)
             .bindPopup("Your Location").openPopup();
           L.circle(e.latlng, { radius: e.accuracy }).addTo(map);
         };
     
         map.on('locationfound', onLocationFound);
         return () => {
           map.off('locationfound', onLocationFound);
         };
       }, [userLocationEnabled, map]); 

        // Routing Control
        useEffect(() => {
          if (!map || !showRoutingOptions || !startCoords || !endCoords) return;
        
          const control = L.Routing.control({
            waypoints: [
              startCoords,
              endCoords
            ],
            routeWhileDragging: true,
            show: false,
            collapsible: true,
            lineOptions: {
              styles: [{ color: '#2563eb', opacity: 0.7, weight: 5 }],
              extendToWaypoints: false,
              missingRouteTolerance: 0
            }
          }).addTo(map);
        
          setRoutingControl(control);
        
          return () => {
            control.remove();
          };
        }, [showRoutingOptions, map, startCoords, endCoords]);
        
          
           useEffect(() => {
            if (!map || !isSearchOpen) return;
          
            const markers = searchResults.map(result => 
              L.marker([parseFloat(result.lat), parseFloat(result.lon)])
                .addTo(map)
                .bindPopup(result.display_name)
            );
          
            return () => {
              markers.forEach(marker => marker.remove());
            };
          }, [searchResults, isSearchOpen, map]);

           // Layer Control
             useEffect(() => {
               if (!map || !isLayersOpen) return;
           
               const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
               const transportLayer = L.layerGroup(); 
               
               const layerControl = L.control.layers({
                 'Base Layer': currentLayer!,
                 'Satellite': satelliteLayer
               }, {
                 'Public Transport': transportLayer
               }).addTo(map);
           
               return () => {
                 layerControl.remove();
               };
             }, [currentLayer, isLayersOpen, map]);


       // Add attribution control to the map
 useEffect(() => {
  if (!map) return;
  
  const attributions = [
    '<a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    '<a href="https://thunderforest.com/" target="_blank">Thunderforest</a>',
    '<a href="https://opentopomap.org/" target="_blank">OpenTopoMap</a>'
  ];

  L.control.attribution({
    position: 'bottomright',
    prefix: false
  })
  .addAttribution(attributions.join(' | '))
  .addTo(map);

}, [map]);         

     // keyboard controls zoom in and out
useEffect(() => {
  if (!map) return;

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === '+') {
      map.zoomIn();
    } else if (e.key === '-') {
      map.zoomOut();
    }
  };

  window.addEventListener('keypress', handleKeyPress);
  return () => window.removeEventListener('keypress', handleKeyPress);
}, [map]);
    
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  

  const menuItems = [
    { label: 'Home', icon: <Home />, id: 'home' },
    { label: 'Saved Places', icon: <BookMarked />, id: 'saved' },
    { label: 'Recent Trips', icon: <Clock />, id: 'recent' },
    { label: 'Favorites', icon: <Heart />, id: 'favorites' },
    { label: 'Downloads', icon: <Download />, id: 'downloads' },
    { label: 'Account', icon: <User />, id: 'account' },
    { label: 'Settings', icon: <Settings />, id: 'settings' },
    { label: 'About', icon: <Info />, id: 'about', path:'/about' },
  ];

  const navigationTabs = [    { label: 'Map', icon: <Map />, id: 'map' },
    { label: 'Search', icon: <Search />, id: 'search' },
    { label: 'Layers', icon: <Layers />, id: 'layers' },
    { label: 'Navigate', icon: <Navigation />, id: 'navigate' },
  ];
   
  const layerOptions = [
    { label: 'OpenStreetMap', id: 'osm', active: true },
    { label: 'Satellite', id: 'satellite', active: false },
    { label: 'Dark Mode', id: 'dark', active: false },
    { label: 'Transport', id: 'transport', active: false },
    { label: 'Terrain', id: 'terrain', active: false },
    { label: 'Traffic', id: 'traffic', active: false },
    { label: 'Choropleth', id: 'choropleth', active: true }
  ];

  
  
  const transportOptions = [
    { label: 'Driving', icon: <Zap />, id: 'driving', active: true },
    { label: 'Public Transit', icon: <Route />, id: 'transit', active: false },
    { label: 'Walking', icon: <User />, id: 'walking', active: false },
    { label: 'Cycling', icon: <User />, id: 'cycling', active: false },
  ];
  
  const notifications = [
    { id: 1, title: "Deothang Coffe", message: "A new coffee shop was added near you", time: "10m ago", icon: <Coffee /> },
    { id: 2, title: "Traffic alert", message: "Deothang traffic", time: "25m ago", icon: <Flag /> },
    { id: 3, title: "Place recommendation", message: "Try visiting JNEC", time: "1h ago", icon: <Star /> }
  ];

  // Add this in your component, before the main return statement
const getColor = (population: number) => {
  return population > 100000 ? '#800026' :
         population > 50000  ? '#BD0026' :
         population > 20000  ? '#E31A1C' :
         population > 10000  ? '#FC4E2A' :
         population > 5000   ? '#FD8D3C' :
         population > 1000   ? '#FEB24C' :
                    '#FFEDA0';
};
// choropleth styling functions and legend component
const styleFeature = (feature: any) => {
  return {
    fillColor: getColor(feature.properties.population),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
};

 
const onEachFeature = (feature: any, layer: L.Layer) => {
  layer.bindPopup(`
    <div class="${darkMode ? 'dark-popup' : ''}">
      <h4 class="font-bold">${feature.properties.name}</h6>
      <p>Population: ${feature.properties.population.toLocaleString()}</p>
    </div>
  `);
};
  //college geocode
  
  
  //toggle layers
  
const toggleLayer = (layerName: string) => {
  setActiveLayers(prev => {
    const newState = { ...prev, [layerName]: !prev[layerName] };
    if (['osm', 'satellite', 'dark'].includes(layerName)) {
      Object.keys(newState).forEach(key => {
        if (['osm', 'satellite', 'dark'].includes(key)) newState[key] = false;
      });
      newState[layerName] = true;
    } else {
      newState[layerName] = !prev[layerName];
    }
    // Handle base layers and overlay layers separately
    switch (layerName) {
      case 'osm':
      case 'satellite':
      case 'dark':
        if (newState[layerName]) {
          let newLayer: L.TileLayer;
          switch (layerName) {
            case 'osm':
              newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
              break;
            case 'satellite':
              newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
              break;
            case 'dark':
              newLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
              break;
            default:
              return prev;
          }
          currentLayer?.remove();
          newLayer.addTo(map!);
          setCurrentLayer(newLayer);
        }
        break;

      case 'transport':
        if (newState.transport) {
          L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map!);
        } else {
          map?.eachLayer(layer => {
            if (layer instanceof L.TileLayer && (layer as any)._url.includes('openstreetmap.fr/hot')) {
              map.removeLayer(layer);
            }
          });
        }
        break;

      case 'terrain':
        if (newState.terrain) {
          L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png').addTo(map!);
        } else {
          map?.eachLayer(layer => {
           if (layer instanceof L.TileLayer && (layer as any)._url.includes('opentopomap.org'))  {
              map.removeLayer(layer);
            }
          });
        }
        break;

      case 'traffic':
        if (newState.traffic) {
          L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png').addTo(map!);
        } else {
          map?.eachLayer(layer => {
           if (layer instanceof L.TileLayer && (layer as any)._url.includes('openstreetmap.fr/osmfr')) {
              map.removeLayer(layer);
            }
          });
        }
        break;

      case 'choropleth':
        if (choroplethLayer) {
          newState.choropleth ? choroplethLayer.addTo(map!) : choroplethLayer.remove();
        }
        break;

      default:
        console.warn(`Layer ${layerName} not implemented`);
    }

    return newState;
  });
};
  
  

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);
  const toggleUserLocation = () => setUserLocationEnabled(!userLocationEnabled);
  const toggleLayers = () => setIsLayersOpen(!isLayersOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleRoutingOptions = () => setShowRoutingOptions(!showRoutingOptions);

  return (
    <div className={`flex ${isDesktop ? 'flex-row' : 'flex-col'} h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Desktop Side Navigation */}
      {isDesktop && (
        <aside className={`w-16 md:w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg flex flex-col transition-all duration-300`}>
          <div className={`p-4 flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Map className="text-blue-600" size={24} />
              {/* Only show text in expanded sidebar */}
              <span className="hidden md:inline">Bhutan Explorer</span>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <nav className="p-2">
              <ul>
                {menuItems.map((item) => (
                  <li key={item.id} className="mb-1">
                   <button 
      className={`flex items-center gap-3 w-full p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} rounded-lg text-left transition-colors`}
      onClick={() => {
        if (item.path) {
          navigate(item.path);
          setActiveTab(item.id);
        } else if (item.id === 'home') {
          navigate('/');
          setActiveTab('map');
        } else {
          setActiveTab(item.id);
        }
      }}
    >
                      <span className={`text-blue-600 ${activeTab === item.id ? 'bg-blue-100 p-2 rounded-lg' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="hidden md:inline">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
            <button 
              onClick={toggleDarkMode}
              className={`flex items-center justify-center md:justify-start w-full p-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} rounded-lg gap-3`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="hidden md:inline">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </aside>
      )}

      <div className={`flex-grow flex flex-col ${isDesktop ? '' : ''}`}>
        {/* Top Header - Mobile Only or Desktop Top Bar */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md p-4 flex justify-between items-center`}>
          {!isDesktop && (
            <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Map className="text-blue-600" size={24} />
              MapExplorer
            </div>
          )}
          
          {isDesktop && (
            <div className="flex items-center">
              <button 
                onClick={toggleSearch}
                className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-4 py-2 rounded-lg w-64`}
              >
                <Search size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Search places...</span>
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {isDesktop && (
              <>
                <button 
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  onClick={() => {}}
                >
                  <Share2 size={20} />
                </button>
                <button 
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  onClick={() => {}}
                >
                  <Info size={20} />
                </button>
              </>
            )}
            <button 
              onClick={toggleNotifications}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors relative`}
            >
              <Bell size={22} />
              <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
            </button>
            {!isDesktop && (
              <button 
                onClick={toggleMenu}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Menu size={22} />
              </button>
            )}
          </div>
        </header>

        {/* Side Menu - Mobile Only */}
        {!isDesktop && isMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="bg-black bg-opacity-50 flex-grow"
              onClick={toggleMenu}
            ></div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} w-64 shadow-lg p-4 flex flex-col`}>
              <div className="flex justify-between items-center mb-6 p-2">
                <h2 className="text-xl font-bold">Menu</h2>
                <button 
                  onClick={toggleMenu}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={`mb-6 p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-600 text-white rounded-full p-2">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Guest User</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign in for more features</p>
                  </div>
                </div>
              </div>
              <nav className="flex-grow overflow-y-auto max-h-[60vh]">
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button 
      className={`flex items-center gap-3 w-full p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} rounded-lg text-left transition-colors`}
      onClick={() => {
        if (item.path) {
          navigate(item.path);
          if (!isDesktop) setIsMenuOpen(false); // Close mobile menu
        }
        setActiveTab(item.id);
      }}
    >
                        <span className="text-blue-600">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className={`mt-4 pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                <button 
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full p-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <div className={`w-10 h-6 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} rounded-full relative`}>
                    <div className={`absolute top-1 ${darkMode ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`}></div>
                  </div>
                </button>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-4`}>MapExplorer v1.0</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="bg-black bg-opacity-50 flex-grow"
              onClick={toggleNotifications}
            ></div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} w-64 shadow-lg p-4 flex flex-col`}>
              <div className="flex justify-between items-center mb-6 p-2">
                <h2 className="text-xl font-bold">Notifications</h2>
                <button 
                  onClick={toggleNotifications}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-grow">
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id} className={`mb-4 p-3 ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b`}>
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-1">
                          {notification.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{notification.title}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{notification.message}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{notification.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
              <button className="mt-4 text-center text-blue-600 text-sm font-medium">
                Mark all as read
              </button>
            </div>
          </div>
        )}

        {/* Layer Options Panel */}
        {isLayersOpen && (
  <div className={`absolute top-16 right-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 w-64 z-10`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold">Map Layers</h3>
      <button onClick={toggleLayers}>
        <X size={18} />
      </button>
    </div>
    <ul className="space-y-2">
      {layerOptions.map((option) => (
        <li key={option.id} className="flex items-center justify-between">
          <span>{option.label}</span>
          <div 
            onClick={() => toggleLayer(option.id)}
            className={`w-10 h-6 ${activeLayers[option.id] ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full relative cursor-pointer`}
          >
            <div className={`absolute top-1 ${activeLayers[option.id] ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`}></div>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

        {/* Routing Options Panel */}
        {showRoutingOptions && (
           <div className={`absolute ${isDesktop ? 'top-20 left-20' : 'bottom-20 left-4 right-4'} ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-lg p-4 z-10 w-96`}>
             <form onSubmit={handleRouteSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Route Options</h3>
              <button onClick={toggleRoutingOptions}>
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-4">
  <div className="flex items-center gap-3 mb-2">
    <MapPin size={16} className="text-blue-600" />
    <input 
      type="text" 
      placeholder="Starting point" 
      value={startPoint}
      onChange={(e) => setStartPoint(e.target.value)}
      className={`flex-grow p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} border-none outline-none`}
      onClick={() => setSelectedPointType('start')}
    />
  </div>
  <div className="flex items-center gap-3">
    <MapPin size={16} className="text-red-600" />
    <input 
      type="text" 
      placeholder="Destination" 
      value={endPoint}
      onChange={(e) => setEndPoint(e.target.value)}
      className={`flex-grow p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} border-none outline-none`}
      onClick={() => setSelectedPointType('end')}
    />
  </div>
</div>
            
            <div className="mb-4">
              <p className="text-sm mb-2 font-medium">Transportation Mode</p>
              <div className="flex justify-between">
                {transportOptions.map(option => (
                  <button 
                    key={option.id}
                    className={`flex flex-col items-center p-2 rounded-lg ${option.active 
                      ? 'bg-blue-600 text-white' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {option.icon}
                    <span className="text-xs mt-1">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              <button className={`flex-1 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                Avoid Tolls
              </button>
              <button className={`flex-1 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                Avoid Highways
              </button>
            </div>
            
            <button 
        type="submit"
        className="w-full mt-4 p-3 bg-blue-600 text-white rounded-lg font-medium"
      >
        Find Route
      </button>
      </form>
            
          </div>
        )}
        

        {/* Main Content Area (Map) */}
        <main className={`flex-grow ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative h-full`}>
        <div 
    ref={mapContainer}
    className="absolute inset-0 z-0 h-[calc(100vh-140px)] md:h-full"
    style={{ width: '100%' }}
  ></div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 md:top-4 md:right-4">
          <button 
    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-full shadow-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
    onClick={() => map?.zoomIn()}
  >
    <Plus size={20} />
  </button>
  <button 
    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-full shadow-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
    onClick={() => map?.zoomOut()}
  >
    <Minus size={20} />
  </button>
            <button 
              className={`p-2 rounded-full shadow-md ${userLocationEnabled ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={toggleUserLocation}
            >
              <LocateFixed size={20} />
            </button>
            <button 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-full shadow-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              onClick={toggleLayers}
            >
              <Layers size={20} />
            </button>
            <button className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-full shadow-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <Compass size={20} />
            </button>
            {/*ruler*/}
            <button 
        className={`p-2 rounded-full shadow-md ${
          drawingMode === 'measure' 
            ? 'bg-blue-600 text-white' 
            : darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={() => {
          setDrawingMode(prev => prev === 'measure' ? null : 'measure');
          setDrawingPoints([]);
        }}
      >
        <Ruler size={20} />
      </button>
      <button
              className={`p-2 rounded-full shadow-md ${
                drawingMode === 'polygon' 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={() => {
                setDrawingMode(prev => prev === 'polygon' ? null : 'polygon');
                setDrawingPoints([]);
              }}
            >
              <Square size={20} />
            </button>
        
            <button
              className={`p-2 rounded-full shadow-md ${
                drawingMode === 'circle' 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={() => {
                setDrawingMode(prev => prev === 'circle' ? null : 'circle');
                setDrawingPoints([]);
              }}
            >
              <Circle size={20} />
            </button>

      {/* Add measurement/drawing panel */}
            {(drawingMode || measurementResult) && (
              <div className={`absolute bottom-65 -left-40 p-3 ${
                darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'
              } rounded-lg shadow-md text-sm flex flex-col gap-2`}>
                {drawingMode === 'measure' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMeasureType('distance')}
                      className={`px-2 py-1 rounded ${
                        measureType === 'distance' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      Distance
                    </button>
                    <button
                      onClick={() => setMeasureType('area')}
                      className={`px-2 py-1 rounded ${
                        measureType === 'area' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      Area
                    </button>
                  </div>
                )}
        
                {measurementResult && (
                  <div className="flex items-center gap-2">
                    <Ruler size={16} />
                    {measurementResult}
                  </div>
                )}
        
                <div className="flex gap-2 ">
                  <button
                    onClick={finalizeDrawing}
                    className="px-2 py-1 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={clearDrawings}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>      

{/*  above the zoom level display */}
{isMeasuring && (
  <div className={`absolute bottom-20 left-4 p-3 ${
    darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'
  } rounded-lg shadow-md text-sm flex items-center gap-2`}>
    <Ruler size={16} />
    {measurePoints.length === 0 && 'Click to start measuring'}
    {measurePoints.length === 1 && 'Click to set end point'}
    {measurePoints.length === 2 && 'Measurement complete - Click to start new'}
  </div>
)}
             {/*  Zoom Level Display Here */}
  <div className="absolute bottom-4 right-4 flex items-center gap-2">
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} px-3 py-1 rounded-full shadow-md text-sm`}>
      Zoom: {zoomLevel}
    </div>
  </div>
          

          
          {/* Additional Desktop Controls - Left Side */}
          {isDesktop && (
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              
              <button 
      onClick={toggleRoutingOptions}
      className={`p-2 rounded-full shadow-md ${
        showRoutingOptions 
          ? 'bg-blue-600 text-white' 
          : darkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <Route size={20} />
    </button>
            </div>
          )}
          
          {/* Search Overlay */}
          {isSearchOpen && (
            <div className={`absolute top-4 left-4 right-4 md:left-20 md:right-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-3`}>
              <div className="flex items-center gap-2 mb-4">
                <Search size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <input
                  type="text"
                  placeholder="Search places..."
                  className={`flex-grow border-none outline-none text-sm ${darkMode ? 'bg-gray-800 text-white' : ''}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={toggleSearch} className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  <X size={18} />
                </button>
              </div>
              {searchQuery && (
                 <div className="max-h-60 overflow-y-auto">
                 <div className="flex justify-between mb-2 px-2">
                   <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                     {searchResults.length} results found
                   </p>
                   <button className="text-xs text-blue-600 flex items-center gap-1">
                     <Filter size={14} /> Filter
                   </button>
                 </div>
                 <ul>
             {searchResults.map(result => (
      <li 
      key={result.place_id}
      onClick={() => {
        if (map) {
          const latLng = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
          map.setView(latLng, 15);
        }
      }}
    >
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            <span className="line-clamp-1 text-left">{result.display_name}</span>
          </div>
          <ChevronRight size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
        </li>
      ))}
    </ul>
    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 px-2`}>
      Search by OpenStreetMap
    </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar - Mobile Only */}
        {!isDesktop && (
          <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-2`}>
            <ul className="flex justify-around">
              {navigationTabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'search') toggleSearch();
                      if (tab.id === 'layers') toggleLayers();
                      if (tab.id === 'navigate') toggleRoutingOptions();
                    }}
                    className={`flex flex-col items-center p-2 ${
                      activeTab === tab.id ? 'text-blue-600' : darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-blue-600' : darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {tab.icon}
                    </span>
                    <span className="text-xs mt-1">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
