import { createContext } from "react";
import { MapRef } from "react-map-gl";

export type CellTower = {
  id: string;
  longitude: number;
  latitude: number;
  frequency: number;
  ptx: number;
  gtx: number;
  grx: number;
  antennaHeight: number;
  maxSensitivity: number;
  coverage?: GeoJSON.FeatureCollection;
  margin?: number;
  cableLoss?: number;
  additionalLoss?: number;
  scenario?: 'urban' | 'suburban' | 'rural';
  sectorRotation?: number; // Nuevo campo para rotar sectores
};

type CoverageContextType = {
  selectedTower: CellTower | undefined;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addAntenna: () => void;
  removeAntenna: () => void;
  calculateCoverage: () => void;
  selectTower: (towerId: string) => void;
  cellTowers: CellTower[];
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  setViewState: React.Dispatch<
    React.SetStateAction<{
      longitude: number;
      latitude: number;
      zoom: number;
      pitch: number;
      bearing: number;
    }>
  >;
  coverage: number;
  handleCoverageChange: (value: number[]) => void;
  updateTowerPosition: (towerId: string, lng: number, lat: number) => void;
  mapRef: React.RefObject<MapRef> | null;
  setMapRef: (ref: React.RefObject<MapRef>) => void;
  updateSelectedTowerScenario: (scenario: 'urban' | 'suburban' | 'rural') => void;
  updateSectorRotation?: (rotation: number) => void; // Nuevo método opcional para cambiar la rotación del sector
};

export const CoverageContext = createContext<CoverageContextType>({
  selectedTower: undefined,
  handleInputChange: () => {},
  addAntenna: () => {},
  removeAntenna: () => {},
  calculateCoverage: () => {},
  selectTower: () => {},
  cellTowers: [],
  viewState: {
    longitude: 0,
    latitude: 0,
    zoom: 10,
    pitch: 0,
    bearing: 0,
  },
  setViewState: () => {},
  coverage: 0.5,
  handleCoverageChange: () => {},
  updateTowerPosition: () => {},
  mapRef: null,
  setMapRef: () => {},
  updateSelectedTowerScenario: () => {},
  updateSectorRotation: () => {},
});
