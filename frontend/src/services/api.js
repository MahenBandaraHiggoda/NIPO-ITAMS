import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', timeout: 15000 })

export async function getAssets(params = {}) {
  const { data } = await api.get('/assets', { params })
  return data.data
}
export async function getAsset(id) {
  const { data } = await api.get(`/assets/${id}`)
  return data.data
}
export async function saveAsset(asset, id) {
  const { data } = id ? await api.put(`/assets/${id}`, asset) : await api.post('/assets', asset)
  return data.data
}
export async function retireAsset(id) {
  const { data } = await api.delete(`/assets/${id}`)
  return data.data
}
export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data.data
}
export function getApiError(error) {
  return error.response?.data?.message || 'Could not connect to the NIPO-ITAMS service. Check that the API is running.'
}
