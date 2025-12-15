export interface AnalyzerData {
  analyzerId: number;
  analyzerName: string;
  analyzerValue: number;
  analyzerUnit: string;
  analyzerType: string;
  isValid: number;
  analyzerRangesValue: any[];
}

export interface DeviceData {
  deviceId: number;
  deviceName: string;
  analyzerData: AnalyzerData[];
  deviceStatusId: number;
  deviceOperationId: number;
  alarmData: any[];
}

export interface LiveDataResponse {
  dateTime: string;
  deviceData: DeviceData[];
}
