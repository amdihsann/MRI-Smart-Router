"use client";

import { useEffect, useRef } from "react";

export default function MriMap({ hospitals, simulationStep, logRouting }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const dataSourceRef = useRef(null);
  const routeDataSourceRef = useRef(null);

  // Ganti dengan Azure Maps Subscription Key milik tim kamu dari Portal Azure
  const AZURE_MAPS_KEY = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;

  useEffect(() => {
    if (!window.atlas) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js";
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (!mapInstance.current) {
      initMap();
    }

    function initMap() {
      if (mapInstance.current) return;
      const map = new window.atlas.Map(mapRef.current, {
        center: [106.8056, -6.2952],
        zoom: 13,
        view: "Auto",
        authOptions: {
          authType: "subscriptionKey",
          subscriptionKey: AZURE_MAPS_KEY,
        },
      });
    
      map.events.add("ready", () => {
        mapInstance.current = map;
        
        // 🏢 1. Data Source Khusus Rumah Sakit
        const dataSource = new window.atlas.source.DataSource();
        map.sources.add(dataSource);
        dataSourceRef.current = dataSource;
    
        // 🛣️ 2. Data Source BERSIH Khusus Rute Jalan (Solusi Bottleneck)
        const routeDataSource = new window.atlas.source.DataSource();
        map.sources.add(routeDataSource);
        routeDataSourceRef.current = routeDataSource; // Amankan ke ref
    
        // 🔴 BubbleLayer HANYA membaca data dari dataSource Rumah Sakit
        map.layers.add(
          new window.atlas.layer.BubbleLayer(dataSource, null, {
            createRadius: 12,
            strokeColor: "#ffffff",
            strokeWidth: 2,
            color: [
              "case",
              ["get", "isHub"], "#000080",
              ["get", "isOverload"], "#ef4444",
              ["get", "isFull"], "#f59e0b",    
              "#10b981"                          
            ]
          })
        );
    
        // 🟢 LineLayer HANYA membaca data dari routeDataSource (Bebas dari Bubble)
        map.layers.add(
          new window.atlas.layer.LineLayer(routeDataSource, null, {
            strokeColor: "#34d399", // Hijau emerald neon biar menyala kontras
            strokeWidth: 5,
            lineJoin: "round",      // Bikin tikungan jalan melengkung halus, ga patah kaku
            lineCap: "round"
          })
        );
    
        updateMapFeatures();
      });
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current && dataSourceRef.current) {
      updateMapFeatures();
    }
  }, [hospitals, simulationStep]);

  const updateMapFeatures = async () => {
    const dataSource = dataSourceRef.current;
    const routeDataSource = routeDataSourceRef.current;

    if (!dataSource || !routeDataSource) return;

    dataSource.clear(); 
    if (!hospitals || hospitals.length === 0) return;

    // 1. Gambar semua pin Rumah Sakit (Warna tetap aman sesuai BubbleLayer)
    hospitals.forEach((rs) => {
      const isOverload = rs.current_occupancy > rs.max_capacity;
      const isFull = rs.current_occupancy === rs.max_capacity;
      const isHub = rs.id_rs === "RS_018";

      if (rs.longitude && rs.latitude) {
        const point = new window.atlas.data.Point([parseFloat(rs.longitude), parseFloat(rs.latitude)]);
        const feature = new window.atlas.data.Feature(point, {
          name: rs.nama_rs,
          isHub: isHub,
          isOverload: isOverload,
          isFull: isFull,
        });
        dataSource.add(feature);
      }
    });

    if (simulationStep === 3 && logRouting && logRouting.length > 0) {
      const fatmawati = hospitals.find(rs => rs.id_rs === "RS_018");
      if (!fatmawati) return;

      const fatmawatiCoordsStr = `${fatmawati.latitude},${fatmawati.longitude}`;
      const targetSudahDigambar = new Set();

      logRouting.forEach(async (log) => {
        if (log.rs_tujuan && log.rs_tujuan.toLowerCase() !== "gagal dialihkan") {
          if (targetSudahDigambar.has(log.rs_tujuan)) return;
          targetSudahDigambar.add(log.rs_tujuan);

          const targetHospital = hospitals.find(rs => rs.nama_rs === log.rs_tujuan);
          
          if (targetHospital && targetHospital.longitude && targetHospital.latitude) {
            const targetCoordsStr = `${targetHospital.latitude},${targetHospital.longitude}`;

            try {
              // 🌍 Tembak API Route Directions resmi Azure Maps
              const routeUrl = `https://atlas.microsoft.com/route/directions/json?api-version=1.0&query=${fatmawatiCoordsStr}:${targetCoordsStr}&subscription-key=${AZURE_MAPS_KEY}&travelMode=car&routeType=fastest`;
              
              const response = await fetch(routeUrl);
              const routeData = await response.json();

              if (routeData.routes && routeData.routes.length > 0) {
                // Ambil susunan titik koordinat jalan asli dari leg pertama
                const points = routeData.routes[0].legs[0].points;
                
                // Konversi format Azure ([lat, lon]) ke format GeoJSON GeoSpatial ([lon, lat])
                const geoJsonPoints = points.map(p => [p.longitude, p.latitude]);

                // 🌟 Gambar LineString mengikuti lekukan jalan raya asli!
                const realRouteLine = new window.atlas.data.LineString(geoJsonPoints);
                
                routeDataSource.add(new window.atlas.data.Feature(realRouteLine));
              }
            } catch (error) {
              console.error("Gagal menarik rute jalan spasial Azure Maps:", error);
              
              const fallbackLine = new window.atlas.data.LineString([
                [parseFloat(fatmawati.longitude), parseFloat(fatmawati.latitude)],
                [parseFloat(targetHospital.longitude), parseFloat(targetHospital.latitude)]
              ]);
              routeDataSource.add(new window.atlas.data.Feature(fallbackLine));
            }
          }
        }
      });
    }
  };

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-lg overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-800" />
    </div>
  );
}