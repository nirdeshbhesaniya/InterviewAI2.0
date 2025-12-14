// src/utils/apiPaths.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API BASE:", import.meta.env.VITE_API_BASE_URL);

export const API = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  PROFILE: {
    GET: `${API_BASE_URL}/profile`,
    UPDATE: `${API_BASE_URL}/profile/update`,
    UPLOAD_PHOTO: `${API_BASE_URL}/profile/upload-photo`,
    CHANGE_PASSWORD: `${API_BASE_URL}/profile/change-password`,
    DELETE_ACCOUNT: `${API_BASE_URL}/profile/delete-account`,
    GET_PREFERENCES: `${API_BASE_URL}/profile/preferences`,
    UPDATE_PREFERENCES: `${API_BASE_URL}/profile/preferences`,
    GET_SECURITY: `${API_BASE_URL}/profile/security`,
    REVOKE_SESSION: `${API_BASE_URL}/profile/revoke-session`,
    TOGGLE_2FA: `${API_BASE_URL}/profile/toggle-2fa`
  },
  INTERVIEW: {
    GET_ALL: `${API_BASE_URL}/interview`,
    CREATE: `${API_BASE_URL}/interview`,
    GET_ONE: (sessionId) => `${API_BASE_URL}/interview/${sessionId}`,
    DELETE: (sessionId) => `${API_BASE_URL}/interview/${sessionId}`,
    EDIT: (sessionId, index) => `${API_BASE_URL}/interview/edit/${sessionId}/${index}`,
    ASK_AI: `${API_BASE_URL}/interview/ask`,
    GENERATE_MORE: (sessionId) => `${API_BASE_URL}/interview/generate-more/${sessionId}`,
    SUMMARIZE: `${API_BASE_URL}/interview/summarize`,
    VERIFY_DELETE_OTP: `${API_BASE_URL}/interview/verify-delete-otp`,
    REQUEST_DELETE_OTP: `${API_BASE_URL}/interview/request-delete-otp`,
  },
  CODE: {
    COMPILE: `${API_BASE_URL}/compile`
  },
  CHATBOT: {
    ASK: `${API_BASE_URL}/chatbot/ask`
  },
  SUPPORT: {
    CONTACT: `${API_BASE_URL}/support/contact`,
    STATS: `${API_BASE_URL}/support/stats`
  },
  MCQ: {
    GENERATE: `${API_BASE_URL}/mcq/generate`,
    SUBMIT: `${API_BASE_URL}/mcq/submit`,
    TOPICS: `${API_BASE_URL}/mcq/topics`,
    HISTORY: `${API_BASE_URL}/mcq/history`,
    GET_TEST: (testId) => `${API_BASE_URL}/mcq/test/${testId}`,
    DELETE_TEST: (testId) => `${API_BASE_URL}/mcq/test/${testId}`
  },
  NOTIFICATIONS: {
    GET_ALL: (userId) => `${API_BASE_URL}/notifications/${userId}`,
    CREATE: `${API_BASE_URL}/notifications`,
    MARK_READ: `${API_BASE_URL}/notifications/mark-read`,
    DELETE: `${API_BASE_URL}/notifications`,
    STATS: (userId) => `${API_BASE_URL}/notifications/stats/${userId}`
  },
  SETTINGS: {
    GET: (userId) => `${API_BASE_URL}/settings/${userId}`,
    UPDATE: (userId) => `${API_BASE_URL}/settings/${userId}`,
    UPDATE_SPECIFIC: (userId, category, setting) => `${API_BASE_URL}/settings/${userId}/${category}/${setting}`
  },
  NOTES: {
    GET_ALL: `${API_BASE_URL}/notes`,
    GET_ONE: (id) => `${API_BASE_URL}/notes/${id}`,
    CREATE: `${API_BASE_URL}/notes`,
    UPDATE: (id) => `${API_BASE_URL}/notes/${id}`,
    DELETE: (id) => `${API_BASE_URL}/notes/${id}`,
    LIKE: (id) => `${API_BASE_URL}/notes/${id}/like`,
    VIEW: (id) => `${API_BASE_URL}/notes/${id}/view`,
    GET_USER_NOTES: (userId) => `${API_BASE_URL}/notes/user/${userId}`
  },
  RESOURCES: {
    GET_ALL: `${API_BASE_URL}/resources`,
    GET_ONE: (id) => `${API_BASE_URL}/resources/${id}`,
    CREATE: `${API_BASE_URL}/resources`,
    UPDATE: (id) => `${API_BASE_URL}/resources/${id}`,
    DELETE: (id) => `${API_BASE_URL}/resources/${id}`,
    DOWNLOAD: (id) => `${API_BASE_URL}/resources/${id}/download`,
    LIKE: (id) => `${API_BASE_URL}/resources/${id}/like`,
    MY_UPLOADS: `${API_BASE_URL}/resources/user/my-uploads`
  }
};
