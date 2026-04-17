import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, 
  Fuel, 
  Droplet, 
  Car, 
  CreditCard, 
  Banknote, 
  CheckCircle, 
  ChevronLeft, 
  Wind, 
  Smartphone, 
  Store, 
  Navigation,
  Info,
  Home,
  Map as MapIcon,
  User,
  AlertCircle,
  Plus,
  Minus,
  LocateFixed,
  Camera,
  ChevronRight,
  Zap,
  BatteryCharging,
  Clock
} from 'lucide-react';

// --- MAP COMPONENTS ---
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
      <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); map.zoomIn(); }} 
          className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-600 active:bg-gray-100 transition-colors border-b border-gray-100 outline-none"
        >
           <Plus size={20} className="stroke-[3px]" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); map.zoomOut(); }} 
          className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-600 active:bg-gray-100 transition-colors outline-none"
        >
           <Minus size={20} className="stroke-[3px]" />
        </button>
      </div>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); map.flyTo(center, 14, { duration: 1.5 }); }}
        className="w-12 h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl active:scale-95 text-white transition-all outline-none"
      >
        <LocateFixed size={20} />
      </button>
    </div>
  );
};

// --- VEHICLE DATA ---
interface VehicleOption {
  id: string;
  label: string;
  maxLiters: number;
  examples: string;
  efficiency: number; // km per liter
}

const PETROL_VEHICLES: VehicleOption[] = [
  { id: 'p1', label: 'Moped / Scooter', maxLiters: 10, examples: 'Honda PCX160, Vespa 150', efficiency: 45 },
  { id: 'p2', label: 'Commuter Bike', maxLiters: 15, examples: 'Bajaj Pulsar 150, Suzuki Gixxer', efficiency: 50 },
  { id: 'p3', label: 'Sportbike', maxLiters: 18, examples: 'Honda CBR650R, Suzuki Hayabusa', efficiency: 25 },
  { id: 'p4', label: 'Adventure / Touring', maxLiters: 30, examples: 'BMW R 1300 GS, Triumph', efficiency: 20 },
  { id: 'p5', label: 'Hatchback Car', maxLiters: 50, examples: 'Maruti Swift', efficiency: 18 },
  { id: 'p6', label: 'Sedan (Mid-sized)', maxLiters: 65, examples: 'Toyota Camry', efficiency: 14 },
  { id: 'p7', label: 'Full-sized SUV', maxLiters: 100, examples: 'Toyota Land Cruiser', efficiency: 8 },
];

const DIESEL_VEHICLES: VehicleOption[] = [
  { id: 'd1', label: 'Hatchback', maxLiters: 45, examples: 'Tata Altroz, Hyundai i20', efficiency: 22 },
  { id: 'd2', label: 'Compact Sedan', maxLiters: 45, examples: 'Maruti Dzire, Honda Amaze', efficiency: 24 },
  { id: 'd3', label: 'Compact SUV', maxLiters: 50, examples: 'Tata Nexon, Venue, Sonet', efficiency: 18 },
  { id: 'd4', label: 'Mid-Size SUV/MPV', maxLiters: 60, examples: 'Creta, Seltos, Scorpio-N', efficiency: 15 },
  { id: 'd5', label: 'Large/Premium SUV', maxLiters: 80, examples: 'Toyota Fortuner, Thar', efficiency: 12 },
];

const EV_VEHICLES: VehicleOption[] = [
  { id: 'e1', label: 'Tesla Model 3', maxLiters: 80, examples: 'Standard Range, Long Range', efficiency: 6.5 },
  { id: 'e2', label: 'Tesla Model Y', maxLiters: 85, examples: 'AWD, Performance', efficiency: 5.8 },
  { id: 'e3', label: 'AutoCar EV', maxLiters: 100, examples: 'Premium EV Sedan', efficiency: 5.2 },
  { id: 'e4', label: 'BYD Atto 3', maxLiters: 60, examples: 'Electric SUV', efficiency: 6.2 },
];

// --- TYPES ---
type PaymentMethod = 'Credit Card' | 'bKash' | 'Pay at Station';

// --- DATA MODELS ---
type FuelType = 'Petrol' | 'Diesel' | 'EV Wireless' | 'Diesel Wireless';
type AmenityType = 'Convenience Store' | 'Car Wash' | 'Air Station' | 'Restroom' | 'ATM' | 'Emergency';

interface FuelDetail {
  type: FuelType;
  pricePerLiter: number;
  available: boolean;
}

interface Station {
  id: string;
  name: string;
  address: string;
  distance: string;
  lat: number;
  lng: number;
  amenities: AmenityType[];
  fuels: FuelDetail[];
  image: string;
}

// --- MOCK DATA ---
const INITIAL_STATIONS: Station[] = [
  { id: 's1', name: "A. Rahman & Son's", address: 'Charfassion- Bhola Hwy', distance: '1.2 km', lat: 22.6854, lng: 90.6480, amenities: ['Convenience Store', 'Restroom'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/a-rahman/400/300' },
  { id: 's2', name: 'Ms Saudia Filling Station', address: 'Burhanuddin - Lalmohon Rd', distance: '3.5 km', lat: 22.6950, lng: 90.6500, amenities: ['ATM'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s2/400/300' },
  { id: 's3', name: 'MS Saaudia Filling Station', address: 'Burhanuddin - Lalmohon Rd', distance: '4.2 km', lat: 22.6970, lng: 90.6510, amenities: ['Restroom'], fuels: [{ type: 'Petrol', pricePerLiter: 126, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s3/400/300' },
  { id: 's4', name: 'পিওর অয়েল স্টোর', address: 'Char Fasson', distance: '6.5 km', lat: 22.670, lng: 90.630, amenities: ['Convenience Store'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 110, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s4/400/300' },
  { id: 's5', name: 'এন মোহাম্মদ ফিলিং স্টেশন', address: 'Lalmohan - Char Fasson Rd', distance: '4.8 km', lat: 22.690, lng: 90.660, amenities: ['ATM', 'Restroom'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s5/400/300' },
  { id: 's6', name: 'BHAI BHAI STOR', address: 'Thana Road', distance: '2.1 km', lat: 22.682, lng: 90.645, amenities: [], fuels: [{ type: 'Petrol', pricePerLiter: 124, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s6/400/300' },
  { id: 's7', name: 'উম্মাহ ট্রেডার্স', address: 'Burhanuddin', distance: '5.3 km', lat: 22.698, lng: 90.655, amenities: ['Restroom'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s7/400/300' },
  { id: 's8', name: 'MS Brothers Filling Station', address: 'Charfassion Sadar', distance: '8.1 km', lat: 22.660, lng: 90.620, amenities: ['Car Wash'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s8/400/300' },
  { id: 's9', name: 'Pk.Black.Vai', address: 'Char Annadaprasad', distance: '3.9 km', lat: 22.675, lng: 90.640, amenities: [], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s9/400/300' },
  { id: 's10', name: 'Sundarban Gas Company', address: 'Bhola Industrial Area', distance: '2.5 km', lat: 22.688, lng: 90.642, amenities: [], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 22, available: true }], image: 'https://picsum.photos/seed/s10/400/300' },
  { id: 's11', name: 'মোল্লা পট্টি', address: 'Bhola', distance: '1.5 km', lat: 22.683, lng: 90.643, amenities: [], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s11/400/300' },
  { id: 's12', name: 'হাওলাদার হার্ডওয়্যার এন্ড অয়েল', address: 'Charfassion- Bhola Hwy', distance: '7.2 km', lat: 22.665, lng: 90.630, amenities: [], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s12/400/300' },
  { id: 's13', name: 'যমুনা', address: 'Charfassion- Bhola Hwy', distance: '8.5 km', lat: 22.655, lng: 90.615, amenities: ['Restroom'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s13/400/300' },
  { id: 's15', name: 'Fire Service Lalmohon', address: '8PGH+669, R890', distance: '10.5 km', lat: 22.750, lng: 90.700, amenities: ['Emergency'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s15/400/300' },
  { id: 's16', name: 'Lalmohan Bazar', address: 'Lalmohan', distance: '12.1 km', lat: 22.760, lng: 90.710, amenities: ['Convenience Store'], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s16/400/300' },
  { id: 's17', name: 'Lalmohan Launch Ghat', address: 'Lalmohan', distance: '12.5 km', lat: 22.765, lng: 90.715, amenities: ['Restroom'], fuels: [{ type: 'Petrol', pricePerLiter: 0, available: false }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s17/400/300' },
  { id: 's18', name: 'Sundarban Gas Station (System Op)', address: 'Bhola Industrial Area', distance: '3.2 km', lat: 22.688, lng: 90.645, amenities: [], fuels: [{ type: 'Petrol', pricePerLiter: 125, available: true }, { type: 'Diesel', pricePerLiter: 108, available: true }, { type: 'EV Wireless', pricePerLiter: 20, available: true }], image: 'https://picsum.photos/seed/s18/400/300' }
];

const MOCK_STATIONS_DATA = INITIAL_STATIONS;

const getCustomMarkerIcon = (station: Station) => {
  const hasEV = station.fuels.some(f => f.type === 'EV Wireless' && f.available);
  const price = station.fuels[0]?.pricePerLiter || 0;
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: ${hasEV ? '#4f46e5' : '#dc2626'}; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 12px ${hasEV ? 'rgba(79, 70, 229, 0.4)' : 'rgba(220, 38, 38, 0.4)'}; border: 2px solid white; display: flex; align-items: center; gap: 4px; pointer-events: auto; white-space: nowrap;">
        ${hasEV 
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 22 4-4"/><path d="M19 14v4.5a2.5 2.5 0 0 1-5 0V7a2 2 0 0 0-4 0v11"/><path d="M11 7V5.5a2.5 2.5 0 0 1 5 0V11"/><path d="M6 7h1v4.5a2.5 2.5 0 0 1-5 0V7c0-2 2-2 2-2h4c1 0 2 1 2 2v2H6Z"/></svg>'
        }
        <span>৳${price}</span>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 20],
    popupAnchor: [0, -10],
  });
};

const userLocationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8 pointer-events-none">
      <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60 animate-ping"></span>
      <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const AMENITY_ICONS: Record<AmenityType, React.ReactNode> = {
  'Convenience Store': <Store size={18} className="text-gray-500" />,
  'Car Wash': <Car size={18} className="text-gray-500" />,
  'Air Station': <Wind size={18} className="text-gray-500" />,
  'Restroom': <Droplet size={18} className="text-gray-500" />,
  'ATM': <Banknote size={18} className="text-gray-500" />,
  'Emergency': <AlertCircle size={18} className="text-gray-500" />
};const TankerAnimation = ({ liters, max, fuelType }: { liters: number, max: number, fuelType: string }) => {
  const percentage = Math.min(100, Math.max(0, (liters / max) * 100));
  const isPetrol = fuelType === 'Petrol';
  const isDiesel = fuelType === 'Diesel';
  const isEVWireless = fuelType === 'EV Wireless';
  // Red for Petrol, Amber for Diesel, Blue for EV, Green for Diesel Wireless
  const fuelColor = isPetrol ? '#FF0000' : (isDiesel ? '#f59e0b' : (isEVWireless ? '#4f46e5' : '#10b981')); 
  
  return (
    <div className="relative w-full max-w-[320px] mx-auto mt-8 mb-12 select-none pr-4 scale-95 sm:scale-110">
      {/* Truck Chassis Shadow */}
      <div className="absolute bottom-[-4px] left-4 right-4 h-2 bg-black/10 blur-xl rounded-full" />

      <motion.div 
        animate={{ y: [0, -1, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="relative"
      >
        {/* The Tanker Body */}
        <div className="relative w-full h-36 border-[5px] border-gray-900 rounded-[3rem] bg-gray-100 shadow-2xl overflow-hidden flex flex-col justify-end z-20">
          {/* Metallic Sheen Base */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-white to-gray-300 pointer-events-none" />
          
          {/* RED EX Logo ON TANK (Always visible) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-[7rem] font-black italic tracking-tighter">RED EX</span>
          </div>

          {/* Liquid Container */}
          <motion.div 
            className="relative w-full overflow-visible"
            animate={{ height: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 45, damping: 12 }}
          >
            {/* Wave Layer */}
            <div className="absolute -top-4 left-0 right-0 h-5 overflow-visible">
               <motion.div 
                  className="w-[200%] h-full flex"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               >
                  <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 320" style={{ fill: fuelColor }}>
                    <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                  </svg>
               </motion.div>
            </div>

            {/* Solid Liquid */}
            <div className="absolute inset-0 z-10" style={{ backgroundColor: fuelColor }}>
              {/* Dynamic Highlights of liquid */}
              <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-r from-black/20 via-white/30 to-black/20" />
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
            </div>

            {/* Liters Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none overflow-hidden pb-4">
              <span className="font-black text-6xl text-white/40">{liters}L</span>
            </div>
          </motion.div>

          {/* Tank Straps */}
          <div className="absolute inset-0 pointer-events-none border-x-[30px] border-black/5" />
          <div className="absolute left-1/3 top-0 bottom-0 w-3 bg-black/5" />
          <div className="absolute right-1/3 top-0 bottom-0 w-3 bg-black/5" />
        </div>

        {/* Tanker Support/Wheels Container */}
        <div className="flex justify-around px-12 -mt-4 relative z-40">
           <div className="w-12 h-12 border-4 border-gray-900 bg-gray-800 rounded-full flex items-center justify-center shadow-xl">
             <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-gray-500 rounded-full" /></div>
           </div>
           <div className="w-12 h-12 border-4 border-gray-900 bg-gray-800 rounded-full flex items-center justify-center shadow-xl">
             <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-gray-500 rounded-full" /></div>
           </div>
           <div className="w-12 h-12 border-4 border-gray-900 bg-gray-800 rounded-full flex items-center justify-center shadow-xl">
             <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-gray-500 rounded-full" /></div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- APP COMPONENT ---
type ViewState = 'stations' | 'detail' | 'checkout' | 'success';
type MainTab = 'home' | 'areas' | 'profile';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('stations');
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  // Location state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Hide splash after 3 seconds
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Update distances based on live location
  const MOCK_STATIONS = useMemo(() => {
    if (!userLocation) return MOCK_STATIONS_DATA;
    return MOCK_STATIONS_DATA.map(station => {
      const dist = calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng);
      return {
        ...station,
        distance: `${dist.toFixed(1)} km away`
      };
    }).sort((a, b) => {
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    });
  }, [userLocation]);

  // Order state
  const [selectedFuel, setSelectedFuel] = useState<FuelDetail | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);
  const [liters, setLiters] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');

  // Profile state
  const [userProfile, setUserProfile] = useState({
    name: '',
    mobile: '',
    area: '',
    location: '',
    vehicleType: 'Car'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handlers
  const handleFuelSelect = (fuel: FuelDetail) => {
    if (!fuel.available) return;
    setSelectedFuel(fuel);
    const vehicles = fuel.type === 'Petrol' ? PETROL_VEHICLES : fuel.type === 'EV Wireless' ? EV_VEHICLES : DIESEL_VEHICLES;
    setSelectedVehicle(vehicles[0]);
    setLiters(Math.min(liters, vehicles[0].maxLiters));
  };

  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
    const initialFuel = station.fuels.find(f => f.available) || station.fuels[0];
    handleFuelSelect(initialFuel);
    setCurrentView('detail');
  };

  const handleGoBack = () => {
    if (currentView === 'detail') setCurrentView('stations');
    if (currentView === 'checkout') setCurrentView('detail');
  };

  const handleProceedToCheckout = () => {
    // Mandate profile completion before checkout
    if (!userProfile.name.trim() || !userProfile.mobile.trim() || !userProfile.area.trim() || !userProfile.location.trim()) {
      setShowProfileAlert(true);
      setTempProfile(userProfile);
      setIsEditingProfile(true);
      setMainTab('profile');
      setCurrentView('stations');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setShowProfileAlert(false);
    if (selectedFuel && selectedFuel.available && liters > 0) {
      setIsProcessingCheckout(true);
      setTimeout(() => {
        setIsProcessingCheckout(false);
        setCurrentView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setCurrentView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  const resetApp = () => {
    setSelectedStation(null);
    setSelectedFuel(null);
    setSelectedVehicle(null);
    setLiters(10);
    setCurrentView('stations');
  };

  const orderTotal = selectedFuel ? (selectedFuel.pricePerLiter * liters).toFixed(2) : '0.00';
  const estimatedRange = selectedVehicle ? liters * selectedVehicle.efficiency : 0;

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pb-24 selection:bg-red-100 selection:text-red-900 relative select-none">
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-red-600 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div 
              initial={{ x: -window.innerWidth }}
              animate={{ x: window.innerWidth }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              className="text-white drop-shadow-lg mb-6"
            >
              <Car size={120} strokeWidth={1} />
            </motion.div>
            <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3, duration: 0.5 }}
               className="text-center"
            >
               <h1 className="text-white font-black text-7xl tracking-tighter mb-2 drop-shadow-xl italic">RED<span className="opacity-80">EX</span></h1>
               <span className="text-[10px] font-black text-white/90 tracking-[0.4em] uppercase mt-4 block drop-shadow-sm">Global Logistics & Express Solutions</span>
               <div className="flex gap-2 justify-center mt-12 drop-shadow-sm">
                 <motion.div className="w-3 h-3 bg-white rounded-full" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, delay: 0 }} />
                 <motion.div className="w-3 h-3 bg-white rounded-full" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, delay: 0.2 }} />
                 <motion.div className="w-3 h-3 bg-white rounded-full" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, delay: 0.4 }} />
               </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Loading Overlay Checkout */}
        {isProcessingCheckout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center"
          >
            <motion.div
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-red-200"
            >
               {selectedFuel?.type === 'EV Wireless' ? <Zap size={32} /> : <Droplet size={32} />}
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Preparing {selectedFuel?.type === 'EV Wireless' ? 'Slot' : 'Order'}...</h2>
            <div className="flex gap-1.5">
              <motion.div className="w-2 h-2 bg-red-600 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: 0 }} />
              <motion.div className="w-2 h-2 bg-red-600 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: 0.15 }} />
              <motion.div className="w-2 h-2 bg-red-600 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: 0.3 }} />
            </div>
          </motion.div>
        )}

        {/* Loading Overlay Payment */}
        {isProcessingPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center"
          >
            <motion.div
               animate={{ rotateY: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200"
            >
               <CheckCircle size={32} />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
            <div className="flex gap-1.5">
              <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: 0 }} />
              <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: 0.15 }} />
              <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: 0.3 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100/50 shadow-sm px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentView !== 'stations' && currentView !== 'success' && (
            <button 
              onClick={handleGoBack}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors mr-1"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
          )}
          <div onClick={() => { setMainTab('home'); setCurrentView('stations'); }} className="flex items-center gap-2 cursor-pointer">
            <span className="font-black text-xl tracking-tighter text-gray-900 italic uppercase">Red<span className="text-red-600">Ex</span></span>
          </div>
        </div>
        
        {/* User avatar handling */}
        <div 
          onClick={() => { setMainTab('profile'); setCurrentView('stations'); }}
          className="w-10 h-10 rounded-full bg-red-50 border border-red-100 overflow-hidden flex items-center justify-center shadow-sm hover:border-red-300 transition-colors cursor-pointer"
        >
          {userProfile.name ? (
             <span className="font-bold text-sm text-red-600">
               {userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
             </span>
          ) : (
             <User size={18} className="text-red-500" />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {currentView === 'stations' && (
            <motion.div
              key="stations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
             {mainTab === 'home' && (
              <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby Stations</h1>
                <p className="text-gray-500">Find fuel and amenities near your location in Bangladesh.</p>
              </div>

              <div className="space-y-5">
                {MOCK_STATIONS.map((station) => (
                  <div 
                    key={station.id}
                    onClick={() => handleSelectStation(station)}
                    className="group relative bg-white border border-gray-100 rounded-[24px] p-5 hover:border-red-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full -z-10" />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="pr-4">
                        <h2 className="text-[19px] font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight mb-1.5">{station.name}</h2>
                        <div className="flex items-center text-gray-500 text-[13px] font-medium">
                          <MapPin size={14} className="mr-1.5 text-gray-400" />
                          <span className="truncate max-w-[200px]">{station.address}</span>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-2xl text-[11px] font-bold text-gray-700 flex-shrink-0 flex items-center gap-1">
                        <Navigation size={12} className="text-red-500" />
                        {station.distance}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50 relative z-10">
                      {/* Fuels */}
                      <div className="flex flex-wrap gap-2 pt-1 transition-all">
                        {station.fuels.map(f => (
                          <div key={f.type} className={`flex items-center bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100 ${!f.available ? 'opacity-50 grayscale' : ''} hover:bg-white hover:shadow-sm transition-all`}>
                            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm mr-2 flex-shrink-0 relative">
                               {f.type === 'EV Wireless' ? (
                                  <Zap size={11} className="text-red-500 fill-current" />
                               ) : (
                                  <>
                                    <Droplet size={11} style={{ color: f.type === 'Petrol' ? '#ff4500' : '#eab308' }} className="fill-current opacity-20 absolute top-[6px]" />
                                    <Droplet size={11} style={{ color: f.type === 'Petrol' ? '#ff4500' : '#eab308' }} className="relative z-10" />
                                  </>
                               )}
                            </div>
                            <div className="flex flex-col">
                               <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{f.type === 'EV Wireless' ? 'EV Wireless' : f.type}</div>
                               <div className="font-bold text-gray-900 text-[12px] mt-0.5 leading-none">৳{f.pricePerLiter}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Amenities Mini */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {station.amenities.slice(0, 3).map(amenity => (
                          <div key={amenity} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500" title={amenity}>
                            {React.cloneElement(AMENITY_ICONS[amenity] as React.ReactElement, { size: 14 })}
                          </div>
                        ))}
                        {station.amenities.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                            +{station.amenities.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-5 bottom-8 text-gray-300 group-hover:text-red-500 transition-colors group-hover:translate-x-1 duration-300">
                        <ChevronRight size={20} />
                    </div>
                  </div>
                ))}
              </div>
              </>
             )}
             
             {mainTab === 'areas' && (
               <div className="space-y-4">
                 <div>
                   <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Map</h1>
                   <p className="text-gray-500">Find real-time nearby stations.</p>
                 </div>
                 
                 <div className="w-full h-[450px] bg-gray-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-[6px] border-white relative z-0">
                    <MapContainer center={userLocation || [22.6854, 90.6480]} zoom={13} style={{ height: '100%', width: '100%' }} attributionControl={false} zoomControl={false}>
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      />
                      <MapController center={userLocation || [22.6854, 90.6480]} />
                      {userLocation && (
                        <Marker position={userLocation} icon={userLocationIcon}>
                           <Popup>
                              <div className="font-bold text-center p-1 px-2 text-blue-600 text-sm">You are here</div>
                           </Popup>
                        </Marker>
                      )}
                      {MOCK_STATIONS.map((station) => (
                        <Marker key={station.id} position={[station.lat, station.lng]} icon={getCustomMarkerIcon(station)}>
                          <Popup className="custom-popup">
                            <div className="flex flex-col items-center text-center p-2">
                              <strong className="text-gray-900 text-lg leading-tight w-full max-w-[180px] break-words">{station.name}</strong>
                              <span className="text-gray-500 font-bold text-xs mt-1 mb-2 bg-gray-100/80 px-2 py-0.5 rounded-md">{station.distance}</span>
                              <button 
                                onClick={() => { setMainTab('home'); handleSelectStation(station); }} 
                                className="mt-2 w-full bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                Order Fuel <ChevronRight size={16} className="text-white/80" />
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                 </div>

                 <h2 className="font-bold text-gray-900 mt-8 mb-2 pb-2 border-b border-gray-100">Local Stations</h2>
                 <div className="space-y-4 pb-8">
                   {MOCK_STATIONS.map(station => (
                     <div key={`area-${station.id}`} className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all overflow-hidden" onClick={() => { setMainTab('home'); handleSelectStation(station); }}>
                       <div className="absolute inset-y-0 left-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="flex items-center justify-between">
                         <div className="pr-4">
                           <div className="font-bold text-gray-900 text-[17px] group-hover:text-red-600 transition-colors leading-tight mb-0.5">{station.name}</div>
                           <div className="text-[13px] text-gray-500 flex items-center">
                             <MapPin size={12} className="mr-1 text-gray-400" />
                             <span className="truncate max-w-[200px]">{station.address}</span>
                           </div>
                         </div>
                         <div className="flex flex-col items-end gap-2">
                           <div className="bg-red-50 text-red-700 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                             {station.distance}
                           </div>
                           <ChevronRight className="text-gray-300 group-hover:text-red-500 transition-colors" size={18} />
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {mainTab === 'profile' && (
               <div className="space-y-6">
                 <div>
                   <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
                   <p className="text-gray-500">Manage your personal information and vehicles.</p>
                 </div>

                 {showProfileAlert && isEditingProfile && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-medium flex items-start gap-3">
                     <AlertCircle className="shrink-0 mt-0.5" size={20} />
                     <div>Please complete your profile information before placing an order.</div>
                   </motion.div>
                 )}

                 <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative">
                    {!isEditingProfile ? (
                      <>
                        <button 
                          onClick={() => { setTempProfile(userProfile); setIsEditingProfile(true); }}
                          className="absolute top-6 right-6 text-red-600 text-sm font-bold underline"
                        >
                          Edit
                        </button>
                        
                        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <User size={32} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{userProfile.name || 'Set your name'}</h2>
                            <p className={`mt-1 text-sm ${userProfile.mobile ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
                              {userProfile.mobile || 'Mobile missing'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Region / Area</span>
                            <span className={`font-bold ${userProfile.area ? 'text-gray-900' : 'text-red-500'}`}>
                              {userProfile.area || 'Required'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Exact Location</span>
                            <span className={`font-bold ${userProfile.location ? 'text-gray-900' : 'text-red-500'}`}>
                              {userProfile.location || 'Required'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-500 font-medium">Primary Vehicle</span>
                            <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                              {userProfile.vehicleType || 'Not set'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-5">
                        <h3 className="font-bold text-lg border-b border-gray-100 pb-2 mb-4">Edit Information</h3>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all font-medium text-gray-900" 
                            value={tempProfile.name}
                            onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                            placeholder="e.g. Kamrul Hasan"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile Number</label>
                          <input 
                            type="tel" 
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all font-medium text-gray-900" 
                            value={tempProfile.mobile}
                            onChange={e => setTempProfile({...tempProfile, mobile: e.target.value})}
                            placeholder="+880..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Area Region</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all font-medium text-gray-900" 
                              value={tempProfile.area}
                              onChange={e => setTempProfile({...tempProfile, area: e.target.value})}
                              placeholder="e.g. Barishal"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle</label>
                            <select 
                              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all font-medium text-gray-900 bg-white"
                              value={tempProfile.vehicleType}
                              onChange={e => setTempProfile({...tempProfile, vehicleType: e.target.value})}
                            >
                              <option value="Car">Car</option>
                              <option value="Bike">Bike / Motorcycle</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Specific Location</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all font-medium text-gray-900" 
                            value={tempProfile.location}
                            onChange={e => setTempProfile({...tempProfile, location: e.target.value})}
                            placeholder="Sadar Road..."
                          />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                          <button 
                            onClick={() => { setIsEditingProfile(false); setShowProfileAlert(false); }}
                            className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => { setUserProfile(tempProfile); setIsEditingProfile(false); setShowProfileAlert(false); }}
                            className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Save Profile
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
               </div>
             )}
            </motion.div>
          )}

          {currentView === 'detail' && selectedStation && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedStation.name}</h1>
                <div className="flex flex-wrap items-center text-gray-500 mt-2 font-medium">
                  <MapPin size={16} className="mr-1" />
                  <span>{selectedStation.address}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <Navigation size={14} className="mr-1" />
                  <span className="text-red-600 font-semibold">{selectedStation.distance}</span>
                </div>

                {/* Quick Booking for Charging Slot */}
                <div className="mt-6 p-5 bg-red-600 rounded-3xl shadow-xl border border-red-500 flex flex-col sm:flex-row items-center justify-between gap-4 group overflow-hidden relative">
                   <div className="absolute inset-0 bg-red-600 -z-0"></div>
                   <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform">
                      <Zap size={80} className="text-white" />
                   </div>
                   <div className="relative z-10 w-full sm:w-auto text-center sm:text-left">
                      <div className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em] mb-1.5">Ultra-Fast Service</div>
                      <div className="text-white font-bold text-lg flex flex-col sm:flex-row items-center gap-2">
                         <span>Wireless Charging Slot</span>
                         <span className="bg-white text-red-600 shadow-sm text-[10px] px-2.5 py-1 rounded-full border border-white uppercase tracking-wider font-black">Available</span>
                      </div>
                   </div>
                   <button 
                      onClick={() => {
                        const evFuel = selectedStation.fuels.find(f => f.type === 'EV Wireless');
                        if (evFuel) handleFuelSelect(evFuel);
                        const orderSection = document.getElementById('order-section');
                        if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto bg-white text-red-600 font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:bg-gray-100 active:scale-95 transition-all relative z-10 text-sm whitespace-nowrap"
                   >
                      Book Now
                   </button>
                </div>
              </div>

              {/* Amenities Section */}
              <div>
                 <h3 className="text-lg font-bold mb-3">Station Amenities</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedStation.amenities.map(amenity => (
                      <div key={amenity} className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm text-gray-700">
                          {AMENITY_ICONS[amenity]}
                        </div>
                        <span className="text-sm font-semibold text-center text-gray-700">{amenity}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Fuel Ordering Section */}
              <div id="order-section" className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-5 flex items-center">
                  <span className="bg-red-50 text-red-600 p-1.5 rounded-lg mr-2">
                    {selectedFuel?.type === 'EV Wireless' ? <Zap size={20} /> : <Droplet size={20} />}
                  </span>
                  {selectedFuel?.type === 'EV Wireless' ? 'Book Charging Slot' : 'Order Fuel'}
                </h3>
                
                {selectedFuel?.type === 'EV Wireless' && (
                   <div className="mb-5 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-center gap-2">
                      <BatteryCharging size={18} className="text-red-600" />
                      <span className="text-sm font-bold text-red-700">Ultra-Fast 150kW Wireless Charging</span>
                   </div>
                )}
                
                <div className="space-y-6">
                  {/* Fuel Type Selector */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">1. Select Fuel Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedStation.fuels.map(fuel => {
                        const isSelected = selectedFuel?.type === fuel.type;
                        return (
                          <button
                            key={fuel.type}
                            disabled={!fuel.available}
                            onClick={() => handleFuelSelect(fuel)}
                            className={`p-4 rounded-2xl border text-left flex flex-col transition-all outline-none relative overflow-hidden ${
                              !fuel.available 
                                ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' 
                                : isSelected 
                                  ? 'border-red-600 bg-red-50 ring-2 ring-red-600 shadow-md' 
                                  : 'border-gray-200 bg-white hover:border-red-300 shadow-sm'
                            }`}
                          >
                             <div className="flex items-center justify-between w-full mb-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                   {fuel.type === 'EV Wireless' ? <Zap size={16} className={isSelected ? 'fill-current' : ''} /> : <Droplet size={16} className={isSelected ? 'fill-current' : ''} />}
                                </div>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                                {!fuel.available && <span className="text-[8px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase">Out</span>}
                             </div>
                             
                             <div className="space-y-0.5">
                                <div className={`font-black text-sm uppercase tracking-tight ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>{fuel.type}</div>
                                <div className="flex items-baseline gap-1">
                                   <span className={`text-lg font-black ${isSelected ? 'text-red-600' : 'text-gray-900'}`}>৳{fuel.pricePerLiter}</span>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-red-700/60' : 'text-gray-400'}`}>/ {fuel.type === 'EV Wireless' ? 'kWh' : 'L'}</span>
                                </div>
                             </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vehicle & Liters Selector */}
                  {selectedFuel && selectedFuel.available && selectedVehicle && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                      
                      {/* Vehicle Type Selector */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">2. Select Vehicle Type</label>
                        <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {(selectedFuel.type === 'Petrol' ? PETROL_VEHICLES : selectedFuel.type === 'EV Wireless' ? EV_VEHICLES : DIESEL_VEHICLES).map(vehicle => {
                            const isSelected = selectedVehicle.id === vehicle.id;
                            return (
                              <button
                                key={vehicle.id}
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  if (liters > vehicle.maxLiters) setLiters(vehicle.maxLiters);
                                }}
                                className={`flex-shrink-0 w-40 p-3 rounded-xl border text-left flex flex-col transition-all snap-start outline-none ${
                                  isSelected
                                    ? 'border-red-600 bg-red-50 ring-1 ring-red-600 shadow-sm'
                                    : 'border-gray-200 bg-gray-50 hover:border-red-300'
                                }`}
                              >
                                <span className={`font-bold text-sm leading-tight ${isSelected ? 'text-red-900' : 'text-gray-700'}`}>{vehicle.label}</span>
                                <span className={`text-[10px] mt-1 line-clamp-2 leading-tight flex-1 ${isSelected ? 'text-red-700/80' : 'text-gray-500'}`}>{vehicle.examples}</span>
                                <span className={`text-xs font-bold mt-2 ${isSelected ? 'text-red-600' : 'text-gray-400'}`}>Max {vehicle.maxLiters}{selectedFuel.type === 'EV Wireless' ? 'kWh' : 'L'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">3. {selectedFuel.type === 'EV Wireless' ? 'Capacity (kWh)' : 'Quantity (Liters)'}</label>
                        
                        {/* Interactive Fuel Tanker Animation */}
                        {selectedFuel.type !== 'EV Wireless' ? (
                          <TankerAnimation liters={liters} max={selectedVehicle.maxLiters} fuelType={selectedFuel.type} />
                        ) : (
                          <div className="w-full bg-gradient-to-br from-red-600 to-red-500 rounded-[32px] p-6 shadow-lg flex flex-col items-center justify-center text-white relative overflow-hidden mb-6">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                             <div className="absolute top-0 right-10 bottom-0 flex items-center opacity-20">
                               <Zap size={100} strokeWidth={1} />
                             </div>
                             <div className="relative z-10 flex flex-col items-center mt-2">
                                <BatteryCharging size={36} className="mb-2 animate-pulse" />
                                <span className="font-black text-4xl">{liters} kWh</span>
                             </div>
                             <div className="mt-5 pt-4 border-t border-white/20 w-full text-center relative z-10 pb-1">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/70 block mb-1">Technology Powered by</span>
                                <div className="text-sm font-black text-white tracking-wide">Prangon / rean / ifaz</div>
                             </div>
                          </div>
                        )}

                        <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-6">
                          <div className="flex items-center justify-between mt-1 px-1">
                            <button 
                              onClick={() => setLiters(Math.max(1, liters - 1))}
                              className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-red-600 active:scale-95 transition-all outline-none"
                            >
                              <Minus size={28} strokeWidth={2.5} />
                            </button>

                            <div className="flex-1 flex flex-col items-center justify-center relative">
                               <div className="text-5xl font-black text-gray-900 tracking-tighter">{liters}</div>
                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 relative -top-1">{selectedFuel.type === 'EV Wireless' ? 'kWh' : 'Liters'}</div>
                            </div>
                            
                            <button 
                              onClick={() => setLiters(Math.min(selectedVehicle.maxLiters, liters + 1))}
                              className="w-16 h-16 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all outline-none"
                            >
                              <Plus size={28} strokeWidth={2.5} />
                            </button>
                          </div>
                          
                          <div className="px-6 py-5 mt-2">
                            <input 
                              type="range" 
                              min="1" 
                              max={selectedVehicle.maxLiters} 
                              step="1"
                              value={liters}
                              onChange={(e) => setLiters(parseInt(e.target.value))}
                              className="w-full accent-red-600 h-2.5 bg-gray-100 rounded-full appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between mt-3 px-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <span>1{selectedFuel.type === 'EV Wireless' ? 'kWh' : 'L'}</span>
                              <span>{selectedVehicle.maxLiters}{selectedFuel.type === 'EV Wireless' ? 'kWh' : 'L'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Efficiency Predictor */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={`${selectedVehicle.id}-${liters}`}
                          className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent opacity-50 rounded-bl-full -z-0" />
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-blue-600 flex items-center justify-center border border-blue-100 relative overflow-hidden">
                              {/* Animated Speed Lines */}
                              <motion.div 
                                className="absolute top-3 w-3 h-[2px] bg-blue-100 rounded-full"
                                animate={{ x: [48, -20], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                              />
                              <motion.div 
                                className="absolute top-8 w-2 h-[2px] bg-blue-200 rounded-full"
                                animate={{ x: [48, -20], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: 0.2 }}
                              />
                              <motion.div 
                                className="absolute top-5 w-4 h-[2px] bg-blue-100 rounded-full"
                                animate={{ x: [48, -20], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: 0.4 }}
                              />
                              
                              {/* Bouncing Car */}
                              <motion.div
                                animate={{ y: [0, -1.5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }}
                                className="relative z-10"
                              >
                                <Car size={24} />
                              </motion.div>
                            </div>
                            <div>
                               <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Predicted Range</div>
                               <div className="text-sm font-semibold text-gray-700">Driving a {selectedVehicle.label}</div>
                            </div>
                          </div>
                          <div className="text-right relative z-10">
                            <div className="text-2xl font-black text-gray-900 tracking-tight">{estimatedRange}<span className="text-sm font-bold text-gray-500 ml-1">KM</span></div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Estim.</div>
                          </div>
                        </motion.div>
                      </div>
                      
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 pt-6 border-t border-gray-100">
                        <div className="w-full sm:w-auto text-center sm:text-left">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Estimated Total</div>
                          <div className="text-4xl font-black text-gray-900 tracking-tight">৳{orderTotal}</div>
                        </div>
                        <motion.button 
                          onClick={handleProceedToCheckout}
                          disabled={isProcessingCheckout}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          layout
                          className={`w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-red-100 flex items-center justify-center gap-2 overflow-hidden ${isProcessingCheckout ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          {isProcessingCheckout ? (
                            <>
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <span>{selectedFuel.type === 'EV Wireless' ? 'Reserve Slot & Pay' : 'Proceed to Checkout'}</span>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'checkout' && selectedStation && selectedFuel && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
                <p className="text-gray-500 mt-1 font-medium">Review your order and select payment method.</p>
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-3 flex items-center">
                  Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Station</span>
                    <span className="font-bold text-right text-gray-900">{selectedStation.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Fuel</span>
                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{selectedFuel.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Quantity</span>
                    <span className="font-bold text-gray-900">{liters} L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Price per Liter</span>
                    <span className="font-bold text-gray-900">৳{selectedFuel.pricePerLiter.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-500 text-lg">Total to Pay</span>
                    <span className="font-black text-3xl text-red-600">৳{orderTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-bold text-lg mb-3">Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { id: 'Credit Card', icon: <CreditCard size={20} />, description: 'Pay securely with card' },
                    { id: 'bKash', icon: <Smartphone size={20} />, description: 'Mobile Financial Services' },
                    { id: 'Pay at Station', icon: <Banknote size={20} />, description: 'Cash or card at the counter' }
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`w-full flex items-center p-4 border rounded-xl transition-all outline-none ${
                          isSelected 
                            ? 'border-red-600 bg-red-50 ring-1 ring-red-600 shadow-sm' 
                            : 'border-gray-200 hover:border-red-300 bg-white shadow-sm hover:shadow'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors ${isSelected ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                          {method.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{method.id}</div>
                          <div className={`text-sm ${isSelected ? 'text-red-700/80 font-medium' : 'text-gray-500'}`}>{method.description}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-red-600' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <motion.button 
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-red-100 flex justify-center items-center gap-2 overflow-hidden ${isProcessingPayment ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {isProcessingPayment ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      Confirm & Pay <span className="opacity-90 ml-2 bg-red-700/50 px-2 py-0.5 rounded-md text-sm">৳{orderTotal}</span>
                    </>
                  )}
                </motion.button>
                <p className="text-center text-xs font-medium text-gray-500 mt-4 flex items-center justify-center">
                  <Info size={14} className="mr-1.5 text-gray-400" />
                  Payments are secure and encrypted.
                </p>
              </div>

            </motion.div>
          )}

          {currentView === 'success' && (
             <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="text-center py-16 space-y-6 flex flex-col items-center"
             >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle size={48} strokeWidth={2.5} />
                </div>
                
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Confirmed!</h1>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Your order for <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{liters}L of {selectedFuel?.type}</span> is sent to <span className="font-bold text-gray-900">{selectedStation?.name}</span>.
                </p>

                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 mx-auto w-full max-w-sm text-left mt-8 relative">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-center gap-2">
                    <Camera className="text-red-600 shrink-0" size={18} />
                    <span className="text-xs font-bold text-red-700">Remember to take a screenshot for this order number</span>
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order Number</div>
                  <div className="font-mono text-2xl font-bold tracking-widest text-gray-900 mb-5">#RF-{Math.floor(100000 + Math.random() * 900000)}</div>
                  
                  <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Status</div>
                  <div className="font-bold text-green-600 flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-flex">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2.5 animate-pulse" />
                    Ready for fulfillment
                  </div>
                </div>

                <div className="pt-10 w-full max-w-sm">
                  <button 
                    onClick={resetApp}
                    className="w-full bg-gray-900 hover:bg-black active:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Back to Main Menu
                  </button>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {currentView === 'stations' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-safe z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <button 
              onClick={() => setMainTab('home')}
              className={`flex flex-col items-center p-2 transition-colors ${mainTab === 'home' ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Home size={24} className="mb-1" />
              <span className="text-[10px] font-bold tracking-wider">HOME</span>
            </button>
            <button 
              onClick={() => setMainTab('areas')}
              className={`flex flex-col items-center p-2 transition-colors ${mainTab === 'areas' ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <MapIcon size={24} className="mb-1" />
              <span className="text-[10px] font-bold tracking-wider">AREAS</span>
            </button>
            <button 
              onClick={() => setMainTab('profile')}
              className={`flex flex-col items-center p-2 transition-colors ${mainTab === 'profile' ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <User size={24} className="mb-1" />
              <span className="text-[10px] font-bold tracking-wider">PROFILE</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
