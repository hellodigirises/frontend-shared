// src/modules/agent/pages/HeatmapPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Chip, Button, CircularProgress,
} from '@mui/material';
import { LocationOn, MyLocation, Refresh } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, TIME } from '../hooks';
import { doLogLocation } from '../store/agentSlice';
import { PageHeader, Card, StatCard } from '../components/ui';
import { agentApi } from '../api/agent.api';

interface LocationPoint {
  latitude  : number;
  longitude : number;
  timestamp : string;
  activity? : string;
  address?  : string;
}

const ACTIVITY_COLOR: Record<string, string> = {
  TRAVELLING : A.primary,
  MEETING    : A.indigo,
  IDLE       : A.textSub,
};

const ACTIVITY_ICON: Record<string, string> = {
  TRAVELLING: '🚗',
  MEETING   : '🤝',
  IDLE      : '⏸',
};

export default function HeatmapPage() {
  const dispatch = useAppDispatch();
  const [locations, setLocations]   = useState<LocationPoint[]>([]);
  const [loading,   setLoading]     = useState(false);
  const [gpsStatus, setGpsStatus]   = useState<'idle' | 'tracking' | 'error'>('idle');
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId,    setWatchId]    = useState<number | null>(null);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const r = await agentApi.get('/heatmap');
      setLocations(r.data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
    return () => {
      if (watchId !== null) navigator.geolocation?.clearWatch(watchId);
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('tracking');
    const id = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        dispatch(doLogLocation({
          latitude, longitude, accuracy,
          speed: speed ?? undefined,
          activity: speed && speed > 5 ? 'TRAVELLING' : 'IDLE',
        }));
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation?.clearWatch(watchId);
      setWatchId(null);
    }
    setGpsStatus('idle');
  };

  const logManual = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        dispatch(doLogLocation({
          latitude : pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy : pos.coords.accuracy,
          activity : 'MEETING',
        }));
        loadLocations();
      },
      () => setGpsStatus('error'),
    );
  };

  // Timeline grouping — group by 30-minute windows
  const grouped: { time: string; points: LocationPoint[] }[] = [];
  locations.forEach(pt => {
    const slot = new Date(pt.timestamp);
    slot.setMinutes(Math.floor(slot.getMinutes() / 30) * 30, 0, 0);
    const label = TIME(slot);
    const last  = grouped[grouped.length - 1];
    if (last && last.time === label) last.points.push(pt);
    else grouped.push({ time: label, points: [pt] });
  });

  const travelPoints  = locations.filter(l => l.activity === 'TRAVELLING').length;
  const meetingPoints = locations.filter(l => l.activity === 'MEETING').length;
  const totalKm       = locations.length > 1
    ? parseFloat(
        locations.slice(1).reduce((dist, pt, i) => {
          const prev = locations[i];
          const R    = 6371;
          const dLat = ((pt.latitude  - prev.latitude)  * Math.PI) / 180;
          const dLng = ((pt.longitude - prev.longitude) * Math.PI) / 180;
          const a    = Math.sin(dLat / 2) ** 2
            + Math.cos((prev.latitude * Math.PI) / 180)
            * Math.cos((pt.latitude  * Math.PI) / 180)
            * Math.sin(dLng / 2) ** 2;
          return dist + R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }, 0).toFixed(1),
      )
    : 0;

  return (
    <Box>
      <PageHeader
        title="Location Tracker"
        subtitle="Today's movement timeline"
        action={
          <Box display="flex" gap={1}>
            <Button size="small" variant="outlined" startIcon={<Refresh />}
              onClick={loadLocations}
              sx={{ color: A.textSub, borderColor: A.border, textTransform: 'none', fontSize: 12, borderRadius: '8px' }}>
              Refresh
            </Button>
            {gpsStatus === 'tracking' ? (
              <Button size="small" variant="outlined" startIcon={<MyLocation />}
                onClick={stopTracking}
                sx={{ color: A.red, borderColor: `${A.red}50`, textTransform: 'none', fontSize: 12, borderRadius: '8px' }}>
                Stop Tracking
              </Button>
            ) : (
              <Button size="small" variant="contained" startIcon={<MyLocation />}
                onClick={startTracking}
                sx={{ bgcolor: A.primary, textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: '8px' }}>
                Start Tracking
              </Button>
            )}
          </Box>
        }
      />

      {/* GPS status banner */}
      {gpsStatus === 'tracking' && (
        <Box sx={{
          bgcolor: `${A.green}12`, border: `1px solid ${A.green}30`, borderRadius: '10px',
          px: 2, py: 1.25, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: A.green,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
          }} />
          <Typography sx={{ color: A.green, fontSize: 13, fontWeight: 600 }}>
            Live GPS tracking active
          </Typography>
          {currentPos && (
            <Typography sx={{ color: A.textSub, fontSize: 11.5, ml: 'auto' }}>
              {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}
            </Typography>
          )}
        </Box>
      )}

      {gpsStatus === 'error' && (
        <Box sx={{
          bgcolor: `${A.red}10`, border: `1px solid ${A.red}25`, borderRadius: '10px',
          px: 2, py: 1.25, mb: 2,
        }}>
          <Typography sx={{ color: A.red, fontSize: 13 }}>
            ⚠️ GPS unavailable. Please enable location access.
          </Typography>
        </Box>
      )}

      {/* Summary stats */}
      <Grid container spacing={1.5} mb={2.5}>
        {[
          { label: 'Log Points',   value: locations.length, accent: A.primary, icon: <LocationOn /> },
          { label: 'Travelling',   value: travelPoints,     accent: A.amber,   icon: <LocationOn /> },
          { label: 'Meetings',     value: meetingPoints,    accent: A.indigo,  icon: <LocationOn /> },
          { label: 'Est. Distance',value: `${totalKm} km`,  accent: A.green,   icon: <LocationOn /> },
        ].map(c => (
          <Grid item xs={6} sm={3} key={c.label}>
            <StatCard {...c} loading={loading} compact sub={undefined} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Card title="Today's Movement Timeline">
            <Box p={1.5} sx={{ maxHeight: 480, overflowY: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={24} sx={{ color: A.primary }} />
                </Box>
              ) : grouped.length === 0 ? (
                <Box py={5} textAlign="center">
                  <LocationOn sx={{ fontSize: 40, color: A.border, mb: 1 }} />
                  <Typography sx={{ color: A.textSub, fontSize: 13 }}>
                    No location data yet today
                  </Typography>
                  <Typography sx={{ color: A.muted, fontSize: 12, mt: 0.5 }}>
                    Start tracking to log your movements
                  </Typography>
                  <Button variant="outlined" size="small" onClick={logManual} sx={{ mt: 2, color: A.primary, borderColor: `${A.primary}40`, textTransform: 'none', fontSize: 12, borderRadius: '8px' }}>
                    Log Current Location
                  </Button>
                </Box>
              ) : (
                grouped.map((group, gi) => (
                  <Box key={gi} mb={2}>
                    <Typography sx={{ color: A.primary, fontSize: 11.5, fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {group.time}
                    </Typography>
                    {group.points.map((pt, pi) => {
                      const ac = ACTIVITY_COLOR[pt.activity ?? 'IDLE'] ?? A.textSub;
                      return (
                        <Box key={pi} display="flex" alignItems="flex-start" gap={1.5}
                          pl={1.5} mb={0.75}
                          sx={{ borderLeft: `2px solid ${ac}30` }}>
                          <Typography sx={{ fontSize: 14 }}>{ACTIVITY_ICON[pt.activity ?? 'IDLE']}</Typography>
                          <Box flex={1}>
                            {pt.address ? (
                              <Typography sx={{ color: A.text, fontSize: 12.5 }}>{pt.address}</Typography>
                            ) : (
                              <Typography sx={{ color: A.textSub, fontSize: 12, fontFamily: 'monospace' }}>
                                {pt.latitude.toFixed(5)}, {pt.longitude.toFixed(5)}
                              </Typography>
                            )}
                            <Box display="flex" gap={1} mt={0.25}>
                              <Typography sx={{ color: A.muted, fontSize: 11 }}>{TIME(pt.timestamp)}</Typography>
                              {pt.activity && (
                                <Chip label={pt.activity} size="small"
                                  sx={{ fontSize: 9.5, height: 17, bgcolor: `${ac}12`, color: ac }} />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

        {/* Map placeholder + quick log */}
        <Grid item xs={12} md={5}>
          {/* Map embed placeholder — replace with Google Maps / Mapbox */}
          <Box sx={{
            bgcolor: A.surfaceHigh, borderRadius: '14px', border: `1px solid ${A.border}`,
            height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 1.5, mb: 2,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Grid pattern background */}
            <Box sx={{
              position: 'absolute', inset: 0, opacity: 0.04,
              backgroundImage: `
                linear-gradient(${A.primary} 1px, transparent 1px),
                linear-gradient(90deg, ${A.primary} 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }} />
            <LocationOn sx={{ fontSize: 40, color: A.primary, opacity: 0.6 }} />
            <Typography sx={{ color: A.textSub, fontSize: 13, textAlign: 'center', px: 2 }}>
              Map view available with Google Maps API key
            </Typography>
            <Typography sx={{ color: A.muted, fontSize: 11.5, textAlign: 'center', px: 2 }}>
              Configure VITE_MAPS_API_KEY to enable
            </Typography>
            {currentPos && (
              <Box sx={{ bgcolor: `${A.primary}15`, border: `1px solid ${A.primary}30`, borderRadius: '8px', px: 1.5, py: 0.75 }}>
                <Typography sx={{ color: A.primary, fontSize: 11.5, fontFamily: 'monospace' }}>
                  📍 {currentPos.lat.toFixed(4)}, {currentPos.lng.toFixed(4)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Quick log actions */}
          <Card title="Quick Log" pad>
            <Box display="flex" flexDirection="column" gap={1}>
              {[
                { label: '📞 At Client Meeting',  activity: 'MEETING',    color: A.indigo  },
                { label: '🚗 Travelling to Site', activity: 'TRAVELLING', color: A.primary },
                { label: '⏸ Mark Current Location', activity: 'IDLE',   color: A.textSub },
              ].map(btn => (
                <Button key={btn.activity} variant="outlined" fullWidth size="small"
                  onClick={() => {
                    navigator.geolocation?.getCurrentPosition(
                      pos => {
                        dispatch(doLogLocation({
                          latitude : pos.coords.latitude,
                          longitude: pos.coords.longitude,
                          accuracy : pos.coords.accuracy,
                          activity : btn.activity,
                        }));
                        setTimeout(loadLocations, 800);
                      },
                      () => alert('GPS unavailable'),
                    );
                  }}
                  sx={{
                    color: btn.color, borderColor: `${btn.color}35`,
                    textTransform: 'none', fontSize: 13, borderRadius: '10px', py: 0.9,
                    justifyContent: 'flex-start', px: 2,
                    '&:hover': { bgcolor: `${btn.color}10`, borderColor: `${btn.color}60` },
                  }}>
                  {btn.label}
                </Button>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
