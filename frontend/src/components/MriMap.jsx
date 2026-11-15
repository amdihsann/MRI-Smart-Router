"use client";

import { useEffect, useRef } from "react";

export default function MriMap({ hospitals, simulationStep, logRouting }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const dataSourceRef = useRef(null);
  const routeDataSourceRef = useRef(null);
  const popupRef = useRef(null);

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

        // 1. Data Source Khusus Rumah Sakit
        const dataSource = new window.atlas.source.DataSource();
        map.sources.add(dataSource);
        dataSourceRef.current = dataSource;

        // 2. Data Source Khusus Rute Jalan
        const routeDataSource = new window.atlas.source.DataSource();
        map.sources.add(routeDataSource);
        routeDataSourceRef.current = routeDataSource;

        // 3. Layer Pin Rumah Sakit
        const bubbleLayer = new window.atlas.layer.BubbleLayer(dataSource, null, {
          createRadius: 11,
          strokeColor: "#ffffff",
          strokeWidth: 2,
          color: [
            "case",
            ["get", "isHub"], "#000080",
            ["get", "isOverload"], "#ef4444",
            ["get", "isFull"], "#f59e0b",
            "#10b981"
          ]
        });
        map.layers.add(bubbleLayer);

        // 4. Layer Garis Rute Pengalihan
        map.layers.add(
          new window.atlas.layer.LineLayer(routeDataSource, null, {
            strokeColor: "#34d399",
            strokeWidth: 5,
            lineJoin: "round",
            lineCap: "round"
          })
        );

        // 5. Tooltip Popup Interaktif saat Hover Pin RS
        const popup = new window.atlas.Popup({
          pixelOffset: [0, -14],
          closeButton: false,
          fillColor: "#090d16"
        });
        popupRef.current = popup;

        map.events.add("mousemove", bubbleLayer, (e) => {
          if (e.shapes && e.shapes.length > 0) {
            const props = e.shapes[0].getProperties();
            const coords = e.shapes[0].getCoordinates();
            const statusColor = props.isOverload ? "#f87171" : props.isFull ? "#fbbf24" : "#34d399";
            const statusText = props.isOverload ? "OVERLOAD" : props.isFull ? "FULL" : "TERSEDIA";

            popup.setOptions({
              position: coords,
              content: `
                <div style="padding:8px 12px;font-family:sans-serif;color:#f4f4f5;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:#090d16;min-width:165px;">
                  <div style="font-size:11px;font-weight:700;margin-bottom:4px;">${props.name}</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#a1a1aa;">
                    <span>Okupansi: <strong style="color:#fff;">${props.occupancy}/${props.capacity}</strong></span>
                    <span style="color:${statusColor};font-weight:700;margin-left:8px;">${statusText}</span>
                  </div>
                </div>
              `
            });
            popup.open(map);
            map.getCanvasContainer().style.cursor = "pointer";
          }
        });

        map.events.add("mouseleave", bubbleLayer, () => {
          popup.close();
          map.getCanvasContainer().style.cursor = "grab";
        });

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
    routeDataSource.clear();

    if (!hospitals || hospitals.length === 0) return;

    hospitals.forEach((rs) => {
      const isOverload = rs.current_occupancy > rs.max_capacity;
      const isFull = rs.current_occupancy === rs.max_capacity;
      const isHub = rs.id_rs === "RS_018";

      if (rs.longitude && rs.latitude) {
        const point = new window.atlas.data.Point([parseFloat(rs.longitude), parseFloat(rs.latitude)]);
        const feature = new window.atlas.data.Feature(point, {
          name: rs.nama_rs,
          occupancy: rs.current_occupancy,
          capacity: rs.max_capacity,
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
              const routeUrl = `https://atlas.microsoft.com/route/directions/json?api-version=1.0&query=${fatmawatiCoordsStr}:${targetCoordsStr}&subscription-key=${AZURE_MAPS_KEY}&travelMode=car&routeType=fastest`;

              const response = await fetch(routeUrl);
              const routeData = await response.json();

              if (routeData.routes && routeData.routes.length > 0) {
                const points = routeData.routes[0].legs[0].points;
                const geoJsonPoints = points.map(p => [p.longitude, p.latitude]);
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
    <div className="relative h-full min-h-[340px] w-full overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 h-full w-full bg-zinc-900" />
    </div>
  );
}