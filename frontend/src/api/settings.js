import api from './index'

export const settingsAPI = {
  // Get company settings
  getSettings: () => {
    return api.get('/settings')
  },

  // Update company settings
  updateSettings: (data) => {
    return api.put('/settings', data)
  },

  // Upload company logo
  uploadLogo: (formData) => {
    return api.post('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Delete company logo
  deleteLogo: (filename) => {
    return api.delete(`/settings/logo/${filename}`)
  }
}
