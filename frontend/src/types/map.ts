export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
  }
  
  export interface CellTower {
    id: string;
    longitude: number;
    latitude: number;
    ptx: number;
    gtx: number;
    grx: number;
    antennaHeight: number;
    maxSensitivity: number;
  }
  
  