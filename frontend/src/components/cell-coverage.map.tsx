import { useContext, useEffect, useRef } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  FullscreenControl,
  Marker,
  MapRef,
  LayerProps,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { RadioTower } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CoverageContext } from "@/context/coverage-context";
import { useSidebar } from "./ui/sidebar";

interface CellCoverageMapProps {
  showCalculationsDialog: boolean;
  setShowCalculationsDialog: (open: boolean) => void;
  showAntennasDialog: boolean;
  setShowAntennasDialog: (open: boolean) => void;
}

export default function CellCoverageMap({
  showCalculationsDialog,
  setShowCalculationsDialog,
  showAntennasDialog,
  setShowAntennasDialog,
}: CellCoverageMapProps) {
  const { state } = useSidebar();
  const mapRef = useRef<MapRef | null>(null);
  const {
    updateTowerPosition,
    selectTower,
    cellTowers,
    selectedTower,
    viewState,
    setViewState,
    // @ts-ignore
    coverage,
    calculateCoverage,
    setMapRef,
  } = useContext(CoverageContext);

  useEffect(() => {
    if (mapRef.current) {
      setMapRef(mapRef);
    }
  }, [mapRef, setMapRef]);

  const handleMarkerDragEnd = (event: any, towerId: string) => {
    const { lng, lat } = event.lngLat;
    updateTowerPosition(towerId, lng, lat);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      mapRef.current?.resize();
    }, 300);
    return () => clearTimeout(timeout);
  }, [state]);

  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAP_BOX_TOKEN;

  const heatmapLayer: LayerProps = {
    id: "coverage-heatmap",
    type: "heatmap",
    paint: {
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "receivedPower"], -120],
        -120,
        0,
        -50,
        1,
      ],
      "heatmap-intensity": 1,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0,0,255,0)",
        0.2,
        "blue",
        0.4,
        "cyan",
        0.6,
        "lime",
        0.8,
        "yellow",
        1,
        "red",
      ],
      "heatmap-radius": 30,
      "heatmap-opacity": 0.9,
    },
  };

  const selectedTowerId = selectedTower?.id || null;
  const coverageStats = null;

  return (
    <div className="w-full">
      <div className="h-[calc(94.3svh-theme(spacing.2))] w-full">
        <Map
          {...viewState}
          ref={mapRef}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          terrain={{ source: "mapbox-dem", exaggeration: 2 }}
          onLoad={() => {
            // Solo hacemos el cálculo aquí si es la primera vez
            if (mapRef.current) {
              calculateCoverage();
            }
          }}
        >
          <Source
            id="mapbox-dem"
            type="raster-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1"
            tileSize={512}
            maxzoom={11}
          />
          <Layer
            id="hillshading"
            type="hillshade"
            source="mapbox-dem"
            layout={{ visibility: "visible" }}
            paint={{ "hillshade-shadow-color": "#000000" }}
          />
          {cellTowers.map((tower) => {
            if (tower.coverage && tower.coverage.features.length > 0) {
              const sourceId = `coverage-source-${tower.id}`;
              const layerId = `coverage-heatmap-${tower.id}`;

              return (
                <Source
                  key={tower.id}
                  id={sourceId}
                  type="geojson"
                  data={tower.coverage}
                >
                  <Layer
                    {...heatmapLayer}
                    id={layerId} // Asignar ID único a la capa
                    source={sourceId} // Referenciar el id del source
                  />
                </Source>
              );
            }
            return null;
          })}

          {cellTowers.map((tower) => (
            <Marker
              key={tower.id}
              longitude={tower.longitude}
              latitude={tower.latitude}
              anchor="bottom"
              draggable={true}
              onDragEnd={(e) => handleMarkerDragEnd(e, tower.id)}
              onClick={() => selectTower(tower.id)}
            >
              <RadioTower
                className={`w-8 h-8 ${
                  selectedTowerId === tower.id
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
            </Marker>
          ))}
          <NavigationControl position="top-left" />
          <FullscreenControl position="top-left" />
        </Map>
      </div>
      {/* Dialogo Ver Cálculos */}
      <Dialog
        open={showCalculationsDialog}
        onOpenChange={setShowCalculationsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cálculos de la Antena Seleccionada</DialogTitle>
          </DialogHeader>
          {selectedTower && coverageStats ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-200 rounded-md text-black">
                <h3 className="text-lg font-semibold mb-2">
                  Coverage Statistics
                </h3>
                {/* <p>Max Range: {coverageStats.maxRange} km</p>
                <p>Total Area (aprox): {coverageStats.totalArea} km²</p> */}
              </div>
              <div className="p-4 bg-gray-200 rounded-md text-black">
                <h3 className="text-lg font-semibold mb-2">Signal Strength</h3>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>No hay una antena seleccionada o sin cobertura calculada.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogo Ver Antenas */}
      <Dialog open={showAntennasDialog} onOpenChange={setShowAntennasDialog}>
        <DialogContent className="overflow-auto max-h-[80vh] min-w-[1200px]">
          <DialogHeader>
            <DialogTitle>Lista de Antenas</DialogTitle>
          </DialogHeader>
          <table className="min-w-full bg-white text-black rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Longitude</th>
                <th className="px-4 py-2 text-left">Latitude</th>
                <th className="px-4 py-2 text-left">PTX(dBm)</th>
                <th className="px-4 py-2 text-left">GTX(dBi)</th>
                <th className="px-4 py-2 text-left">GRX(dBi)</th>
                <th className="px-4 py-2 text-left">Height(m)</th>
                <th className="px-4 py-2 text-left">MaxSensitivity(dBm)</th>
              </tr>
            </thead>
            <tbody>
              {cellTowers.map((tower) => (
                <tr key={tower.id} className="border-b">
                  <td className="px-4 py-2">{tower.id}</td>
                  <td className="px-4 py-2">{tower.longitude.toFixed(4)}</td>
                  <td className="px-4 py-2">{tower.latitude.toFixed(4)}</td>
                  <td className="px-4 py-2">{tower.ptx}</td>
                  <td className="px-4 py-2">{tower.gtx}</td>
                  <td className="px-4 py-2">{tower.grx}</td>
                  <td className="px-4 py-2">{tower.antennaHeight}</td>
                  <td className="px-4 py-2">{tower.maxSensitivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
