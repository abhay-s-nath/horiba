export interface AnalyzerRange {
  analyzerRangeId: number;
  rangeValue: number;
  isSelected: number;
}

export interface AnalyzerData {
  analyzerId: number;
  analyzerName: string;
  analyzerValue: number;
  // Use 'string | null' because some sensors (like pH or Ethylbenz) don't have units in your JSON
  analyzerUnit: string | null; 
  analyzerType: string;
  analyzerRegulationLimit: number | null;
  isValid: number;
  // Stronger typing for the ranges array
  analyzerRangesValue: AnalyzerRange[];
}

export interface DeviceData {
  deviceId: number;
  deviceName: string;
  deviceTypeId: number;
  deviceType: string;
  deviceImagePath: string;
  deviceStatusId: number;
  deviceOperationId: number;
  // The API shows this as null in the current response
  alarmData: any | null; 
  analyzerData: AnalyzerData[];
}

export interface LiveDataResponse {
  dateTime: string;
  deviceData: DeviceData[];
}