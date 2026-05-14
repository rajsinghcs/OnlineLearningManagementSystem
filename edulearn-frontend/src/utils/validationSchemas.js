import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export const registerSchema = yup.object({
  fullName: yup.string().min(2, 'Min 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Min 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: yup.string().oneOf(['STUDENT', 'INSTRUCTOR'], 'Select a role').required('Role is required'),
});

export const courseSchema = yup.object({
  title: yup.string().min(5, 'Min 5 characters').required('Title is required'),
  description: yup.string().min(20, 'Min 20 characters').required('Description is required'),
  category: yup.string().required('Category is required'),
  level: yup.string().oneOf(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).required('Level is required'),
  price: yup.number().min(0, 'Min 0').required('Price is required'),
  language: yup.string().required('Language is required'),
});

export const lessonSchema = yup.object({
  title: yup.string().min(3, 'Min 3 characters').required('Title is required'),
  contentType: yup.string().oneOf(['VIDEO', 'ARTICLE', 'PDF', 'TEXT', 'EMBED']).required('Type is required'),
  contentUrl: yup.string().trim().required('Content URL is required'),
  durationMinutes: yup.number().min(0, 'Min 0 min').default(0),
});

export const quizSchema = yup.object({
  title: yup.string().required('Title is required'),
  timeLimitMinutes: yup.number().min(1, 'Min 1 min').required('Time limit is required'),
  passingScore: yup.number().min(1, 'Min 1').max(100, 'Max 100').required('Passing score is required'),
  maxAttempts: yup.number().min(1, 'Min 1').required('Max attempts is required'),
});
