import api from "./api";

/**
 * Public, unauthenticated lookup — GET /api/certificates/verify/:certificateNumber
 * already existed on the backend with no auth required; this is the first
 * frontend consumer of it (see build-prompt: no verification page existed).
 */
export const verifyCertificate = async (certificateNumber) => {
  try {
    const { data } = await api.get(`/certificates/verify/${encodeURIComponent(certificateNumber)}`);
    return data?.data || data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to verify certificate" };
  }
};
