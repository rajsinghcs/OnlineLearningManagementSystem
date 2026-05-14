import { aiAxios } from './axiosConfig';

export const aiApi = {
  generateQuiz: (payload) => aiAxios.post('/ai/generate-quiz', payload),
  askTutor: (payload) => aiAxios.post('/ai/ask-question', payload),
};
