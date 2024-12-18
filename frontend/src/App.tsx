import React, { useState, useCallback, useRef } from "react";
import AppSidebar from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CoverageContext, CellTower } from "@/context/coverage-context";
import CellCoverageMap from "./components/cell-coverage.map";
import { v4 as uuidv4 } from "uuid";
import { MapRef } from "react-map-gl";
import { rural_loss, suburban_loss, urban_loss, Ghr, Gvr } from "./lib/utils";

export default function App() {
  const internalMapRef = useRef<MapRef | null>(null);
  const [showCalculationsDialog, setShowCalculationsDialog] = useState(false);
  const [showAntennasDialog, setShowAntennasDialog] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: -71.52493623798038,
    latitude: -16.409593498446455,
    zoom: 11,
    pitch: 60,
    bearing: 40,
  });

  const [coverage, setCoverage] = useState(0.5);
  const [cellTowers, setCellTowers] = useState<CellTower[]>([
    {
      id: uuidv4(),
      longitude: viewState.longitude,
      latitude: viewState.latitude,
      frequency: 900,
      ptx: 35,
      gtx: 15,
      grx: 0,
      antennaHeight: 30,
      maxSensitivity: -100,
      margin: 0,
      cableLoss: 0,
      additionalLoss: 0,
      scenario: "urban",
      sectorRotation: 0, // Valor inicial
    },
  ]);

  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(
    cellTowers[0].id
  );

  const handleCoverageChange = useCallback((value: number[]) => {
    setCoverage(value[0]);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedTowerId === null) return;
      const { name, value } = e.target;
      setCellTowers((prev) =>
        prev.map((tower) => {
          if (tower.id === selectedTowerId) {
            return { ...tower, [name]: parseFloat(value) };
          }
          return tower;
        })
      );
    },
    [selectedTowerId]
  );

  const addAntenna = () => {
    const newTower: CellTower = {
      id: uuidv4(),
      longitude: viewState.longitude + 0.05,
      latitude: viewState.latitude + 0.05,
      frequency: 900,
      ptx: 35,
      gtx: 15,
      grx: 0,
      antennaHeight: 30,
      maxSensitivity: -100,
      margin: 0,
      cableLoss: 0,
      additionalLoss: 0,
      scenario: "urban",
      sectorRotation: 0,
    };
    setCellTowers((prev) => [...prev, newTower]);
    setSelectedTowerId(newTower.id);
  };

  const removeAntenna = () => {
    if (selectedTowerId === null) return;
    setCellTowers((prev) =>
      prev.filter((tower) => tower.id !== selectedTowerId)
    );
    setSelectedTowerId(null);
  };

  function distanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) *
        Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateAzimuth(
    towerLat: number,
    towerLng: number,
    pointLat: number,
    pointLng: number
  ): number {
    const rad = Math.PI / 180;
    const dLon = (pointLng - towerLng) * rad;
    const lat1 = towerLat * rad;
    const lat2 = pointLat * rad;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }

  function calculateCoverageForTower(
    tower: CellTower,
    // @ts-ignore
    mapRef: React.RefObject<MapRef>
  ): GeoJSON.FeatureCollection {
    const {
      longitude,
      latitude,
      ptx,
      gtx,
      grx,
      maxSensitivity,
      antennaHeight,
      frequency,
      margin,
      cableLoss,
      additionalLoss,
      scenario,
      sectorRotation = 0,
    } = tower;

    const f = frequency;
    const h_b = antennaHeight;
    const h_m = 1.5;
    const maxDistance = 20000; // 20 km
    const latRange = 0.4;
    const lngRange = 0.4;
    const latStep = 0.002;
    const lngStep = 0.002;

    const numSectors = 3;
    const sectorAngle = 360 / numSectors;
    const phi_3 = 65; // ángulo de apertura azimutal
    const kh = 0.7;
    const kv = 0.7;
    const kp = 0.7;
    const G0 = 15;
    const theta_3 = 107.6 * Math.pow(10, -0.1 * G0);

    const features: GeoJSON.Feature[] = [];

    function calculateReceivedPowerAtPoint(testLat: number, testLng: number) {
      const distance = distanceInMeters(latitude, longitude, testLat, testLng);
      if (distance > maxDistance) return -9999;

      const d_km = distance / 1000;
      const Lb_urban = urban_loss(f, h_b, h_m, d_km);
      let Lb = Lb_urban;
      if (scenario === "suburban") {
        Lb = suburban_loss(f, Lb_urban);
      } else if (scenario === "rural") {
        Lb = rural_loss(f, Lb_urban);
      }

      const totalLoss =
        (margin || 0) + (cableLoss || 0) + (additionalLoss || 0) + Lb;

      const azimuth = calculateAzimuth(latitude, longitude, testLat, testLng);
      // type: ignore
      let bestSectorCenter = 0;
      let minAngleDiff = 9999;
      for (let s = 0; s < numSectors; s++) {
        const centerAngle = (sectorRotation + s * sectorAngle) % 360;
        let diff = Math.abs(azimuth - centerAngle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minAngleDiff) {
          minAngleDiff = diff;
          bestSectorCenter = centerAngle;
        }
      }

      const lambda_kh = 3 * (1 - Math.pow(0.5, -kh));
      const Ghr_val = Ghr(minAngleDiff, phi_3, kh, lambda_kh);
      const elevationAngle = 0; 
      const Gvr_val = Gvr(elevationAngle, kv, theta_3, kp);

      const totalAntennaGain = gtx + Ghr_val + Gvr_val + grx;
      const receivedPower = ptx + totalAntennaGain - totalLoss;
      return receivedPower;
    }

    for (let latOffset = -latRange; latOffset <= latRange; latOffset += latStep) {
      for (
        let lngOffset = -lngRange;
        lngOffset <= lngRange;
        lngOffset += lngStep
      ) {
        const testLat = latitude + latOffset;
        const testLng = longitude + lngOffset;
        const receivedPower = calculateReceivedPowerAtPoint(testLat, testLng);
        if (receivedPower > maxSensitivity) {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [testLng, testLat],
            },
            properties: {
              receivedPower,
            },
          });
        }
      }
    }

    return {
      type: "FeatureCollection",
      features,
    };
  }

  const calculateCoverage = useCallback(() => {
    if (!internalMapRef.current) {
      console.warn("MapRef not ready yet");
      return;
    }
    setCellTowers((prev) =>
      prev.map((tower) => {
        const coverage = calculateCoverageForTower(tower, internalMapRef);
        return { ...tower, coverage };
      })
    );
  }, []);

  const selectTower = (towerId: string) => {
    setSelectedTowerId(towerId);
  };

  const updateTowerPosition = (towerId: string, lng: number, lat: number) => {
    setCellTowers((prev) =>
      prev.map((tower) =>
        tower.id === towerId ? { ...tower, longitude: lng, latitude: lat } : tower
      )
    );
  };

  const updateSelectedTowerScenario = (
    scenario: "urban" | "suburban" | "rural"
  ) => {
    if (selectedTowerId === null) return;
    setCellTowers((prev) =>
      prev.map((tower) =>
        tower.id === selectedTowerId ? { ...tower, scenario } : tower
      )
    );
  };

  // Nuevo método para actualizar rotación del sector
  const updateSectorRotation = (rotation: number) => {
    if (selectedTowerId === null) return;
    setCellTowers((prev) =>
      prev.map((tower) =>
        tower.id === selectedTowerId ? { ...tower, sectorRotation: rotation } : tower
      )
    );
  };

  const selectedTower = cellTowers.find((t) => t.id === selectedTowerId);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <CoverageContext.Provider
        value={{
          selectedTower,
          handleInputChange,
          addAntenna,
          removeAntenna,
          calculateCoverage,
          selectTower,
          cellTowers,
          viewState,
          setViewState,
          coverage,
          handleCoverageChange,
          updateTowerPosition,
          mapRef: internalMapRef,
          setMapRef: (ref) => {
            if (ref.current) {
              internalMapRef.current = ref.current;
            }
          },
          updateSelectedTowerScenario,
          updateSectorRotation, // Proveer el método al contexto
        }}
      >
        <AppSidebar />
        <SidebarInset className="max-h-screen h-screen">
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Gridly Cell Coverage</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCalculationsDialog(true)}
              >
                View Calculations
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAntennasDialog(true)}
              >
                View Antennas
              </Button>
              <Button variant="outline" onClick={calculateCoverage}>
                Calculate Coverage
              </Button>
            </div>
          </header>
          <div className="max-h-screen">
            <CellCoverageMap
              showCalculationsDialog={showCalculationsDialog}
              setShowCalculationsDialog={setShowCalculationsDialog}
              showAntennasDialog={showAntennasDialog}
              setShowAntennasDialog={setShowAntennasDialog}
            />
          </div>
        </SidebarInset>
      </CoverageContext.Provider>
    </SidebarProvider>
  );
}
