import api from "./api"

export const getDocumentsByVisitId = async (visitId) => {
  try {
    const response = await api.get(`/documents/visit/${visitId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching documents for visit ${visitId}:`, error)
    throw error
  }
}

export const uploadDocument = async (visitId, file) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post(`/documents/upload/${visitId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    console.error("Error uploading document:", error)
    throw error
  }
}

export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/documents/${documentId}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error)
    throw error
  }
}

export const validateDocument = async (file) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    // This endpoint is handled by the Python service
    const response = await api.post("/documents/validate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    console.error("Error validating document:", error)
    throw error
  }
}
