import apiClient from './api'

// Backend'den gelen gerçek JSON yapısı
interface CityData {
  id: string;
  ilId: number;
  ilAdi: string; // Backend'den gelen gerçek field
}

interface DistrictData {
  id: string;
  ilceId: number;
  ilceAdi: string; // Backend'den gelen gerçek field
}

interface TownshipData {
  id: string;
  semtId: number;
  semtBucakBeldeAdi: string; // Backend'den gelen gerçek field
}

interface NeighbourhoodData {
  id: string;
  mahalleId: number;
  mahalleAdi: string; // Backend'den gelen gerçek field
}

export const getCities = async (): Promise<string[]> => {
  console.log('Calling getCities API...');
  console.log('API URL:', '/Adres/iller');
  const { data } = await apiClient.get<CityData[]>('/Adres/iller')
  console.log('API Response:', data);
  return data.map(city => city.ilAdi)
}

export const getDistricts = async (cityName: string): Promise<string[]> => {
  const safeCity = encodeURIComponent(cityName)
  const { data } = await apiClient.get<DistrictData[]>(`/Adres/ilceler/${safeCity}`)
  return data.map(district => district.ilceAdi)
}

export const getTownships = async (
  cityName: string,
  districtName: string
): Promise<string[]> => {
  const safeCity = encodeURIComponent(cityName)
  const safeDistrict = encodeURIComponent(districtName)
  const { data } = await apiClient.get<TownshipData[]>(
    `/Adres/semtler/${safeCity}/${safeDistrict}`
  )
  return data.map(township => township.semtBucakBeldeAdi)
}

export const getNeighbourhoods = async (
  cityName: string,
  districtName: string,
  townshipName: string
): Promise<string[]> => {
  const safeCity = encodeURIComponent(cityName)
  const safeDistrict = encodeURIComponent(districtName)
  const safeTownship = encodeURIComponent(townshipName)
  const { data } = await apiClient.get<NeighbourhoodData[]>(
    `/Adres/mahalleler/${safeCity}/${safeDistrict}/${safeTownship}`
  )
  return data.map(neighbourhood => neighbourhood.mahalleAdi)
}

export default {
  getCities,
  getDistricts,
  getTownships,
  getNeighbourhoods,
}


