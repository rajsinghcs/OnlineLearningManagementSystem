import axios from 'axios';

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  // Request interceptor — attach JWT token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle 401
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authAxios = createAxiosInstance(
  import.meta.env.VITE_AUTH_SERVICE_URL
);
export const courseAxios = createAxiosInstance(
  import.meta.env.VITE_COURSE_SERVICE_URL
);
export const enrollmentAxios = createAxiosInstance(
  import.meta.env.VITE_ENROLLMENT_SERVICE_URL
);
export const assessmentAxios = createAxiosInstance(
  import.meta.env.VITE_ASSESSMENT_SERVICE_URL
);
export const paymentAxios = createAxiosInstance(
  import.meta.env.VITE_PAYMENT_SERVICE_URL
);
export const progressAxios = createAxiosInstance(
  import.meta.env.VITE_PROGRESS_SERVICE_URL
);
export const discnotifAxios = createAxiosInstance(
  import.meta.env.VITE_DISCNOTIF_SERVICE_URL
);
