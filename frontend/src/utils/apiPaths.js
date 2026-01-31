// src/utils/apiPaths.js
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// export const API_BASE_URL = 'https://interviewai2-0sever.onrender.com/api';
// export const API_BASE_URL = 'http://localhost:8080/api';
// export const API_BASE_URL = 'http://104.43.106.43:8080/api';
export const API_BASE_URL = 'https://api.interviewai.tech/api';


export const API = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  VERIFY_REGISTRATION_OTP: `${API_BASE_URL}/auth/verify-registration-otp`,
  RESEND_REGISTRATION_OTP: `${API_BASE_URL}/auth/resend-registration-otp`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  PUBLIC: {
    GET_STATS: `${API_BASE_URL}/public/stats`,
    FIND_PAGE: (type, id, limit) => `${API_BASE_URL}/public/find-page?type=${type}&id=${id}&limit=${limit}`
  },
  FEEDBACK: {
    CREATE: `${API_BASE_URL}/feedback`,
    PUBLIC: `${API_BASE_URL}/feedback/public`,
    ADMIN_GET_ALL: `${API_BASE_URL}/feedback/admin`,
    ADMIN_UPDATE: (id) => `${API_BASE_URL}/feedback/admin/${id}`
  },
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
    TOGGLE_2FA: `${API_BASE_URL}/profile/toggle-2fa`,
    GET_STATS: `${API_BASE_URL}/profile/stats`
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
    ADD_QUESTION: (sessionId) => `${API_BASE_URL}/interview/add-question/${sessionId}`,
    DELETE_QUESTION: (sessionId, qnaId) => `${API_BASE_URL}/interview/${sessionId}/questions/${qnaId}`,
    CHECK_DUPLICATES: `${API_BASE_URL}/interview/check-duplicates`,
    GET_PENDING_APPROVALS: `${API_BASE_URL}/interview/data/pending-approvals`,
    APPROVE_SESSION: (sessionId) => `${API_BASE_URL}/interview/approve-session/${sessionId}`,
    REJECT_SESSION: (sessionId) => `${API_BASE_URL}/interview/reject-session/${sessionId}`,
    INITIALIZE: (sessionId) => `${API_BASE_URL}/interview/initialize/${sessionId}`,
    UPDATE_SESSION: (sessionId) => `${API_BASE_URL}/interview/session/${sessionId}`,
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
    DELETE_TEST: (testId) => `${API_BASE_URL}/mcq/test/${testId}`,
    PRACTICE_LIST: `${API_BASE_URL}/mcq/practice-tests`,
    PRACTICE_DETAILS: (id) => `${API_BASE_URL}/mcq/practice-tests/${id}`
  },
  ADMIN: {
    GET_USERS: `${API_BASE_URL}/admin/users`,
    UPDATE_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}`,
    BAN_USER: (userId) => `${API_BASE_URL}/admin/users/${userId}/ban`,
    GET_PENDING_SESSIONS: `${API_BASE_URL}/admin/pending-sessions`,
    GET_QNA_REQUESTS: `${API_BASE_URL}/admin/qna-requests`,
    APPROVE_QNA: (sessionId, qnaId) => `${API_BASE_URL}/interview/approve-question/${sessionId}/${qnaId}`,
    REJECT_QNA: (sessionId, qnaId) => `${API_BASE_URL}/interview/reject-question/${sessionId}/${qnaId}`,
    APPROVE_ALL_QNA: `${API_BASE_URL}/admin/approve-all-qna`,
    DELETE_INTERVIEW: (id) => `${API_BASE_URL}/admin/interviews/${id}`,
    DELETE_NOTE: (id) => `${API_BASE_URL}/admin/notes/${id}`,
    DELETE_RESOURCE: (id) => `${API_BASE_URL}/admin/resources/${id}`,
    CREATE_PRACTICE_TEST: `${API_BASE_URL}/admin/practice-tests`,
    UPDATE_PRACTICE_TEST: (id) => `${API_BASE_URL}/admin/practice-tests/${id}`,
    GET_PRACTICE_TEST: (id) => `${API_BASE_URL}/admin/practice-tests/${id}`,
    DELETE_PRACTICE_TEST: (id) => `${API_BASE_URL}/admin/practice-tests/${id}`,
    CREATE_NOTIFICATION: `${API_BASE_URL}/admin/notifications/create`,
    GET_BROADCASTS: `${API_BASE_URL}/admin/notifications/broadcasts`,
    DELETE_BROADCAST: (id) => `${API_BASE_URL}/admin/notifications/broadcasts/${id}`,
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
    GET_USER_NOTES: (userId) => `${API_BASE_URL}/notes/user/${userId}`,
    ADMIN_PENDING: `${API_BASE_URL}/notes/admin/pending`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/notes/${id}/status`
  },
  RESOURCES: {
    GET_ALL: `${API_BASE_URL}/resources`,
    GET_ONE: (id) => `${API_BASE_URL}/resources/${id}`,
    CREATE: `${API_BASE_URL}/resources`,
    UPDATE: (id) => `${API_BASE_URL}/resources/${id}`,
    DELETE: (id) => `${API_BASE_URL}/resources/${id}`,
    DOWNLOAD: (id) => `${API_BASE_URL}/resources/${id}/download`,
    LIKE: (id) => `${API_BASE_URL}/resources/${id}/like`,
    MY_UPLOADS: `${API_BASE_URL}/resources/user/my-uploads`,
    ADMIN_PENDING: `${API_BASE_URL}/resources/admin/pending`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/resources/${id}/status`
  }
};
