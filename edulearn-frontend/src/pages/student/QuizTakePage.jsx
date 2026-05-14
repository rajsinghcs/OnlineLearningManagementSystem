import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ClockIcon, 
  AcademicCapIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [quizRes, questionsRes] = await Promise.all([
          assessmentApi.getQuizById(quizId),
          assessmentApi.getQuestions(quizId)
        ]);
        setQuiz(quizRes.data);
        setQuestions(questionsRes.data);
      } catch (err) {
        toast.error('Failed to load quiz');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId, navigate]);

  useEffect(() => {
    let timer;
    if (attempt && timeLeft > 0 && !quizFinished) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizFinished) {
      handleAutoSubmit();
    }
    return () => clearInterval(timer);
  }, [attempt, timeLeft, quizFinished]);

  const startQuiz = async () => {
    try {
      const res = await assessmentApi.startAttempt(quizId, user.userId);
      setAttempt(res.data);
      setTimeLeft((quiz.timeLimitMinutes || 30) * 60);
      toast.success('Quiz started! Good luck.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleAutoSubmit = () => {
    toast.error('Time is up! Submitting your answers...');
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (!attempt) return;
    try {
      setLoading(true);
      const res = await assessmentApi.submitAttempt(attempt.attemptId, answers);
      setResult(res.data);
      setQuizFinished(true);
      toast.success('Quiz submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (quizFinished && result) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="card p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {result.passed ? <CheckCircleIcon className="h-16 w-16" /> : <XCircleIcon className="h-16 w-16" />}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">{result.passed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
            <p className="text-gray-500 font-medium">You have completed the quiz: <span className="font-bold text-gray-700">{quiz.title}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Score</div>
              <div className="text-3xl font-black text-gray-900">{result.score}%</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
              <div className={`text-xl font-black uppercase tracking-widest ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex-1 btn-primary py-4 rounded-xl shadow-lg shadow-primary-100"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="card p-10 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
              <AcademicCapIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{quiz.title}</h1>
              <p className="text-sm text-gray-500 font-medium">{quiz.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase">Time Limit</div>
                <div className="text-sm font-bold text-gray-700">{quiz.timeLimitMinutes} Minutes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <CheckCircleIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase">Passing Score</div>
                <div className="text-sm font-bold text-gray-700">{quiz.passingScore}%</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase">Max Attempts</div>
                <div className="text-sm font-bold text-gray-700">{quiz.maxAttempts}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5 font-medium">
              <li>You must complete the quiz within the time limit.</li>
              <li>Once started, you cannot pause the timer.</li>
              <li>Ensure you have a stable internet connection.</li>
              <li>Your best score will be recorded.</li>
            </ul>
          </div>

          <button 
            onClick={startQuiz}
            className="w-full btn-primary py-4 rounded-xl shadow-lg shadow-primary-200 text-lg"
          >
            Start Quiz Now
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-center">
        <div className="card p-10 space-y-4">
          <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-black text-gray-900">No Questions Found</h2>
          <p className="text-gray-500">This quiz doesn't have any questions yet. Please contact your instructor.</p>
          <button onClick={() => navigate(-1)} className="btn-primary px-8 py-3 rounded-xl">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      {/* Header with Timer */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h2 className="font-black text-gray-900">{quiz.title}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
          <ClockIcon className="h-5 w-5" />
          <span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-600 transition-all duration-500" 
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="card p-10 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-gray-900 leading-tight">
            {currentQuestion.text}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(currentQuestion.options || []).map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = answers[currentQuestion.questionId] === opt;
            return (
              <button
                key={i}
                onClick={() => handleAnswerSelect(currentQuestion.questionId, opt)}
                className={`flex items-center p-5 rounded-2xl border-2 transition-all text-left ${
                  isSelected 
                  ? 'border-primary-600 bg-primary-50 text-primary-900 shadow-md' 
                  : 'border-gray-100 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-black ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {letter}
                </div>
                <span className="font-bold">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-all"
        >
          Previous Question
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <button 
            onClick={submitQuiz}
            className="btn-primary px-10 py-4 rounded-xl shadow-lg shadow-primary-200"
          >
            Finish & Submit Quiz
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTakePage;
