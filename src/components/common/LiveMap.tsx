import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { api } from '../../services/api.ts';
import { IRoute } from '../../types/index.ts';
import { Navigation, RefreshCw, Eye, BatteryCharging, Fuel, Users, ShieldAlert } from 'lucide-react';

interface LiveBusData {
  busId: string;
  busNumber: string;
  registrationNumber: string;
  status: string;
  batteryOrFuelLevel: number;
  fuelType: string;
  capacity: number;
  occupiedSeats: number;
  routeName: string;
  routeCode: string;
  driverName: string;
  currentLocation: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    lastUpdated: string;
    isSimulated: boolean;
  };
  tripCode?: string;
  disclaimer: string;
}

interface LiveMapProps {
  selectedRouteId?: string;
  selectedBusId?: string;
  height?: string;
  showControls?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  selectedRouteId,
  selectedBusId,
  height = '580px',
  showControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Polyline[]>([]);

  const [buses, setBuses] = useState<LiveBusData[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string>(selectedRouteId || 'all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [focusedBusId, setFocusedBusId] = useState<string | null>(selectedBusId || null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center around university campus coordinates
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch routes data
  useEffect(() => {
    api.getRoutes().then((res) => {
      setRoutes(res.routes);
    }).catch(console.error);
  }, []);

  // Draw Route Polyline Paths & Stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || routes.length === 0) return;

    // Clear previous route lines and stops
    routeLinesRef.current.forEach((line) => line.remove());
    routeLinesRef.current = [];
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current = [];

    const routesToDisplay = activeRouteFilter === 'all'
      ? routes
      : routes.filter((r) => r.id === activeRouteFilter);

    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'];

    routesToDisplay.forEach((route, idx) => {
      const color = colors[idx % colors.length];
      const stopLatLngs: [number, number][] = route.stops.map((s) => [s.latitude, s.longitude]);

      if (stopLatLngs.length > 1) {
        const polyline = L.polyline(stopLatLngs, {
          color,
          weight: 4,
          opacity: 0.75,
          dashArray: '8, 8',
        }).addTo(map);

        routeLinesRef.current.push(polyline);
      }

      // Add stops
      route.stops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: `
            <div style="
              width: 14px;
              height: 14px;
              background-color: #0f172a;
              border: 3px solid ${color};
              border-radius: 50%;
              box-shadow: 0 0 8px ${color};
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const stopMarker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-size: 13px; line-height: 1.5; padding: 4px;">
              <p style="font-weight: 700; color: #38bdf8; margin: 0 0 4px;">🚏 ${stop.name}</p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">Route: <strong style="color: #f8fafc;">${route.name}</strong></p>
              <p style="margin: 2px 0 0; color: #94a3b8; font-size: 11px;">Morning Stop Time: <strong style="color: #34d399;">${stop.scheduledTimeMorning}</strong></p>
              <p style="margin: 2px 0 0; color: #94a3b8; font-size: 11px;">Evening Stop Time: <strong style="color: #fbbf24;">${stop.scheduledTimeEvening}</strong></p>
            </div>
          `);

        stopMarkersRef.current.push(stopMarker);
      });
    });
  }, [routes, activeRouteFilter]);

  // Polling Live Bus Locations
  const fetchLiveBuses = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await api.getLiveTracking();
      setBuses(data.buses);
      setLastUpdated(new Date().toLocaleTimeString());

      const map = mapInstanceRef.current;
      if (!map) return;

      data.buses.forEach((bus) => {
        if (!bus.currentLocation) return;
        const { latitude, longitude, speed, heading } = bus.currentLocation;

        const isElectric = bus.fuelType === 'electric';
        const statusColor = bus.status === 'active' ? '#06b6d4' : bus.status === 'maintenance' ? '#f59e0b' : '#64748b';

        // Custom Bus SVG Icon with pulse
        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="
              position: relative;
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0f172a;
              border: 2px solid ${statusColor};
              border-radius: 10px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            " class="${bus.status === 'active' ? 'bus-marker-pulse' : ''}">
              <div style="
                font-size: 11px;
                font-weight: 800;
                color: #ffffff;
                font-family: monospace;
              ">${bus.busNumber}</div>
              <div style="
                position: absolute;
                bottom: -6px;
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid ${statusColor};
              "></div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        if (busMarkersRef.current.has(bus.busId)) {
          const marker = busMarkersRef.current.get(bus.busId)!;
          marker.setLatLng([latitude, longitude]);
          marker.setIcon(busIcon);
        } else {
          const marker = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
          marker.bindPopup(`
            <div style="min-width: 210px; font-size: 13px; line-height: 1.5; padding: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 14px; color: #38bdf8;">🚌 Bus ${bus.busNumber}</span>
                <span style="font-size: 10px; background: rgba(6,182,212,0.2); color: #22d3ee; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700;">${bus.status}</span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">Route: <strong>${bus.routeName}</strong></p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #cbd5e1;">Driver: <strong>${bus.driverName}</strong></p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #cbd5e1;">Live Speed: <strong>${speed} km/h</strong> (Heading ${heading}°)</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #cbd5e1;">Occupancy: <strong>${bus.occupiedSeats} / ${bus.capacity} seats</strong></p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #cbd5e1;">Power/Battery: <strong>${bus.batteryOrFuelLevel}% ${isElectric ? '🔋 EV' : '⛽'}</strong></p>
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 10px; color: #94a3b8; font-style: italic;">
                DEMO DATA: Simulated Campus Transit GPS
              </div>
            </div>
          `);
          busMarkersRef.current.set(bus.busId, marker);
        }
      });

      // If focused bus requested
      if (focusedBusId) {
        const targetBus = data.buses.find((b) => b.busId === focusedBusId);
        if (targetBus && targetBus.currentLocation) {
          map.setView([targetBus.currentLocation.latitude, targetBus.currentLocation.longitude], 15);
        }
      }
    } catch (err) {
      console.error('Failed to poll live bus coordinates:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [focusedBusId]);

  // Initial and recurring poll
  useEffect(() => {
    fetchLiveBuses();
    const interval = setInterval(fetchLiveBuses, 3500);
    return () => clearInterval(interval);
  }, [fetchLiveBuses]);

  const handleFocusBus = (bus: LiveBusData) => {
    setFocusedBusId(bus.busId);
    if (mapInstanceRef.current && bus.currentLocation) {
      mapInstanceRef.current.setView([bus.currentLocation.latitude, bus.currentLocation.longitude], 15);
      const marker = busMarkersRef.current.get(bus.busId);
      if (marker) marker.openPopup();
    }
  };

  const handleResetView = () => {
    setFocusedBusId(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([12.9716, 77.5946], 13);
    }
  };

  return (
    <div className="relative flex flex-col w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 light:border-slate-200 light:bg-white">
      {/* Disclaimer Top Bar (Strictly fulfills: Never pretend simulated GPS is actual bus location) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 border-b border-cyan-800/30 text-xs text-cyan-300 dark:border-cyan-800/30 light:bg-slate-100 light:text-slate-800 light:border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-semibold tracking-wide">
            DEMO DATA: Simulated Campus Transit GPS Coordinates
          </span>
          <span className="hidden sm:inline text-slate-400">· Telemetry updates every 3.5s</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 light:text-slate-600 font-mono text-[11px] tabular-nums">
          <span>Synced: {lastUpdated}</span>
          <button
            onClick={fetchLiveBuses}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Map Control Toolbar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border-b border-slate-800 dark:bg-slate-950/70 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-medium text-slate-400 shrink-0">Filter Route:</span>
            <button
              onClick={() => setActiveRouteFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeRouteFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 light:bg-slate-200 light:text-slate-800'
              }`}
            >
              All Routes ({routes.length})
            </button>
            {routes.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRouteFilter(r.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeRouteFilter === r.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 light:bg-slate-200 light:text-slate-800'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetView}
              className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors light:bg-slate-200 light:text-slate-800"
            >
              Reset Campus View
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div className="relative w-full dark-map" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Live Fleet Quick Drawer at bottom of map */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 dark:bg-slate-950/90 light:bg-slate-50 light:border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Fleet Telemetry ({buses.filter((b) => b.status === 'active').length} of {buses.length} online)
          </span>
          <span className="text-xs text-slate-500">Click any bus card to center view</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {buses.map((bus) => (
            <div
              key={bus.busId}
              onClick={() => handleFocusBus(bus)}
              className={`cursor-pointer rounded-xl p-3 border transition-all ${
                focusedBusId === bus.busId
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-500/20'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850 dark:border-slate-800 light:border-slate-200 light:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-cyan-400 light:text-blue-600 font-mono">
                  {bus.busNumber}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    bus.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : bus.status === 'maintenance'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700/40 text-slate-400'
                  }`}
                >
                  {bus.status}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 truncate dark:text-slate-200 light:text-slate-800">
                {bus.routeName}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-cyan-400" />
                  {bus.currentLocation?.speed || 0} km/h
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  {bus.occupiedSeats}/{bus.capacity}
                </span>
                <span className="flex items-center gap-1">
                  {bus.fuelType === 'electric' ? (
                    <BatteryCharging className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Fuel className="h-3 w-3 text-amber-400" />
                  )}
                  {bus.batteryOrFuelLevel}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
