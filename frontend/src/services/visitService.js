import api from "./api"

export const getVisits = async () => {
  try {
    const response = await api.get("/visits")
    return response.data
  } catch (error) {
    console.error("Error fetching visits:", error)
    throw error
  }
}

export const getVisitById = async (id) => {
  try {
    const response = await api.get(`/visits/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching visit ${id}:`, error)
    throw error
  }
}

export const createVisit = async (visitData) => {
  try {
    const response = await api.post("/visits", visitData)
    return response.data
  } catch (error) {
    console.error("Error creating visit:", error)
    throw error
  }
}

export const updateVisit = async (id, visitData) => {
  try {
    const response = await api.put(`/visits/${id}`, visitData)
    return response.data
  } catch (error) {
    console.error(`Error updating visit ${id}:`, error)
    throw error
  }
}

export const deleteVisit = async (id) => {
  try {
    const response = await api.delete(`/visits/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting visit ${id}:`, error)
    throw error
  }
}
