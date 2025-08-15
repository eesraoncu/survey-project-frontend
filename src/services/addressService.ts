import apiClient from './api'

// Backend'den gelen veri yapısı: { id: number, il: string } formatında
interface CityData {
  id: number;
  il: string;
}

interface DistrictData {
  id: number;
  ilce: string;
}

interface TownshipData {
  id: number;
  bucak: string;
}

interface NeighbourhoodData {
  id: number;
  mahalle: string;
}

export const getCities = async (): Promise<string[]> => {
  const { data } = await apiClient.get<CityData[]>('/Address/cities')
  return data.map(city => city.il)
}

export const getDistricts = async (cityName: string): Promise<string[]> => {
  const safeCity = encodeURIComponent(cityName)
  const { data } = await apiClient.get<DistrictData[]>(`/Address/districts/${safeCity}`)
  return data.map(district => district.ilce)
}

export const getDistrictTownshipTowns = async (
  cityName: string,
  districtName: string
): Promise<string[]> => {
  const safeCity = encodeURIComponent(cityName)
  const safeDistrict = encodeURIComponent(districtName)
  const { data } = await apiClient.get<TownshipData[]>(
    `/Address/district-township-towns/${safeCity}/${safeDistrict}`
  )
  return data.map(township => township.bucak)
}

export const getNeighbourhoods = async (
  cityName: string,
  districtName: string,
  districtTownshipTownName: string
): Promise<string[]> => {
  const safeCity = encodeURIComponent(cityName)
  const safeDistrict = encodeURIComponent(districtName)
  const safeTownship = encodeURIComponent(districtTownshipTownName)
  const { data } = await apiClient.get<NeighbourhoodData[]>(
    `/Address/neighbourhoods/${safeCity}/${safeDistrict}/${safeTownship}`
  )
  return data.map(neighbourhood => neighbourhood.mahalle)
}

export default {
  getCities,
  getDistricts,
  getDistrictTownshipTowns,
  getNeighbourhoods,
}


