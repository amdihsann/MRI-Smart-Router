"use client";

import { useEffect, useRef } from "react";

export default function MriMap({ hospitals, simulationStep, logRouting }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const dataSourceRef = useRef(null);

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
        center: [106.8054, -6.2954],
        zoom: 13,
        view: "Auto",
        authOptions: {
          authType: "subscriptionKey",
          subscriptionKey: AZURE_MAPS_KEY,
        },
      });

      map.events.add("ready", () => {
        mapInstance.current = map;
        const dataSource = new window.atlas.source.DataSource();
        map.sources.add(dataSource);
        dataSourceRef.current = dataSource;

        map.layers.add(
          new window.atlas.layer.BubbleLayer(dataSource, null, {
            createRadius: 12,
            strokeColor: "#ffffff",
            strokeWidth: 2,
            color: [
              "case",
              ["get", "isHub"], "#ff9900",
              ["get", "isOverload"], "#ef4444",
              ["get", "isFull"], "#f59e0b",    
              "#10b981"                         
            ]
          })
        );

        map.layers.add(
          new window.atlas.layer.LineLayer(dataSource, null, {
            strokeColor: "#10b981", 
            strokeWidth: 4,
            lineDashArray: [2, 2] 
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

  const updateMapFeatures = () => {
    const dataSource = dataSourceRef.current;

    if (!dataSource) return;

    dataSource.clear(); 

    if (!hospitals || hospitals.length === 0) return;

    hospitals.forEach((rs) => {
      const isOverload = rs.current_occupancy > rs.max_capacity;
      const isFull = rs.current_occupancy === rs.max_capacity;
      const isHub = rs.id_rs === "RS_020";

      const point = new window.atlas.data.Point([rs.longitude, rs.latitude]);
      const feature = new window.atlas.data.Feature(point, {
        name: rs.nama_rs,
        isHub: isHub,
        isOverload: isOverload,
        isFull: isFull,
      });
      dataSource.add(feature);
    });

    if (simulationStep === 3 && logRouting && logRouting.length > 0) {
      const fatmawati = hospitals.find(rs => rs.id_rs === "RS_020");
      if (!fatmawati) return;
      const fatmawatiCoords = [fatmawati.longitude, fatmawati.latitude];

      const suksesRoute = logRouting.find(log => log.rs_tujuan !== "Gagal Dialihkan");
      
      if (suksesRoute) {
        const targetHospital = hospitals.find(rs => rs.nama_rs === suksesRoute.rs_tujuan);
        
        if (targetHospital) {
          const targetCoords = [targetHospital.longitude, targetHospital.latitude];
          const routeLine = new window.atlas.data.LineString([fatmawatiCoords, targetCoords]);
          dataSource.add(new window.atlas.data.Feature(routeLine));
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-lg overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-800" />
    </div>
  );
}