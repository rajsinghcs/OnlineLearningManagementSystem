import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { courseApi } from '../../api/courseApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { aiApi } from '../../api/aiApi';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QuizManagePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    lessonId: '',
    timeLimitMinutes: 30,
    passingScore: 60,
    maxAttempts: 3
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'MCQ',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    marks: 5
  });

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: '',
    numberOfQuestions: 5,
    difficulty: 'MEDIUM'
  });

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const [qRes, lRes] = await Promise.all([
        assessmentApi.getQuizzesByCourse(courseId),
        courseApi.getLessonsByCourse(courseId)
      ]);
      setQuizzes(qRes.data || []);
      setLessons(lRes.data || []);
    } catch (err) {
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await assessmentApi.getQuestions(quizId);
      setQuestions(res.data || []);
    } catch (err) {
      toast.error('Failed to load assessment questions');
    }
  };

  const handleSelectQuiz = (quiz) => {
    setActiveQuiz(quiz);
    fetchQuestions(quiz.quizId);
    fetchAttempts(quiz.quizId);
  };

  const fetchAttempts = async (quizId) => {
    try {
      const res = await assessmentApi.getAttemptsByQuiz(quizId);
      setAttempts(res.data || []);
    } catch (err) {
      console.error('Failed to load attempts');
    }
  };

  const handleResetAttempt = async (studentId) => {
    if (!window.confirm('Are you sure you want to grant this student another attempt? This will delete their current score.')) return;
    try {
      await assessmentApi.resetAttempts(activeQuiz.quizId, studentId);
      toast.success('Attempt reset. Student can now retake the quiz.');
      setAttempts(attempts.filter(a => a.studentId !== studentId));
    } catch (err) {
      toast.error('Failed to reset attempt');
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...quizForm, 
        courseId: parseInt(courseId),
        lessonId: quizForm.lessonId ? parseInt(quizForm.lessonId) : null 
      };
      const res = await assessmentApi.createQuiz(payload);
      toast.success('Evaluation checklist mapped successfully');
      setQuizzes([...quizzes, res.data]);
      setShowQuizForm(false);
      setQuizForm({ title: '', description: '', lessonId: '', timeLimitMinutes: 30, passingScore: 60, maxAttempts: 3 });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Execution failure during configuration');
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    try {
      setAiGenerating(true);
      const res = await aiApi.generateQuiz(aiForm);
      const aiQuiz = res.data;

      // 1. Create the quiz first
      const quizPayload = {
        title: aiQuiz.title,
        description: `AI Generated Quiz for ${aiForm.topic}`,
        courseId: parseInt(courseId),
        timeLimitMinutes: 30,
        passingScore: 60,
        maxAttempts: 3
      };

      const quizRes = await assessmentApi.createQuiz(quizPayload);
      const createdQuiz = quizRes.data;

      // 2. Add all generated questions
      const questionPromises = aiQuiz.questions.map((q, idx) => {
        return assessmentApi.addQuestion(createdQuiz.quizId, {
          quizId: createdQuiz.quizId,
          text: q.questionText,
          type: 'MCQ',
          options: q.options,
          correctAnswer: q.correctOption,
          marks: 5,
          orderIndex: idx + 1
        });
      });

      await Promise.all(questionPromises);
      
      toast.success('AI Quiz generated and saved successfully!');
      setQuizzes([...quizzes, createdQuiz]);
      setShowAiModal(false);
      handleSelectQuiz(createdQuiz);
    } catch (err) {
      toast.error('AI Generation failed. Check API configuration.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePublish = async (quizId) => {
    try {
      await assessmentApi.publishQuiz(quizId);
      toast.success('Published successfully');
      setQuizzes(quizzes.map(q => q.quizId === quizId ? { ...q, isPublished: true } : q));
      if (activeQuiz?.quizId === quizId) {
        setActiveQuiz({ ...activeQuiz, isPublished: true });
      }
    } catch (err) {
      toast.error('Failed to adjust availability status');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionForm.correctAnswer) {
      return toast.error('Specify absolute answer outcomes.');
    }

    try {
      const payload = {
        quizId: activeQuiz.quizId,
        text: questionForm.text,
        type: questionForm.type,
        options: [questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4],
        correctAnswer: questionForm.correctAnswer,
        marks: parseInt(questionForm.marks),
        orderIndex: questions.length + 1
      };

      const res = await assessmentApi.addQuestion(activeQuiz.quizId, payload);
      toast.success('Item loaded successfully');
      setQuestions([...questions, res.data]);
      setShowQuestionForm(false);
      setQuestionForm({ text: '', type: 'MCQ', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', marks: 5 });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Insertion fault occurred');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 font-bold text-sm">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Return
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowAiModal(true)} className="btn-secondary px-4 py-2 text-xs rounded-xl flex items-center bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100">
              <SparklesIcon className="h-4 w-4 mr-1" /> AI Gen
            </button>
            <button onClick={() => setShowQuizForm(!showQuizForm)} className="btn-primary px-4 py-2 text-xs rounded-xl flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" /> Add Quiz
            </button>
          </div>
        </div>

        {showQuizForm && (
          <form onSubmit={handleQuizSubmit} className="space-y-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
              <input required type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Associated Lesson (Optional)</label>
              <select 
                value={quizForm.lessonId} 
                onChange={(e) => setQuizForm({ ...quizForm, lessonId: e.target.value })} 
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">Course Level (General)</option>
                {lessons.map(l => (
                  <option key={l.lessonId} value={l.lessonId}>{l.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea rows="2" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Limit (Mins)</label>
                <input type="number" value={quizForm.timeLimitMinutes} onChange={(e) => setQuizForm({ ...quizForm, timeLimitMinutes: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Passing %</label>
                <input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
              </div>
            </div>
            <button type="submit" className="w-full py-2 text-xs font-bold bg-primary-600 text-white rounded-xl mt-2">Create Quiz</button>
          </form>
        )}

        {showAiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center mb-6 text-purple-600">
                <SparklesIcon className="h-8 w-8 mr-3" />
                <h2 className="text-2xl font-black italic">AI Quiz Engine</h2>
              </div>
              
              <form onSubmit={handleAiGenerate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Topic or Keywords</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. React Hooks, Photosynthesis..."
                    value={aiForm.topic} 
                    onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })} 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">No. Questions</label>
                    <input 
                      type="number" 
                      min="1" max="10"
                      value={aiForm.numberOfQuestions} 
                      onChange={(e) => setAiForm({ ...aiForm, numberOfQuestions: e.target.value })} 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Difficulty</label>
                    <select 
                      value={aiForm.difficulty} 
                      onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })} 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAiModal(false)}
                    className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={aiGenerating}
                    className="flex-1 py-4 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {aiGenerating ? 'Generating...' : 'Generate Quiz'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h3 className="text-md font-black text-gray-900 mb-4 border-b pb-2 uppercase tracking-wider">Available Modules</h3>
        <div className="space-y-2">
          {quizzes.map((q) => (
            <div key={q.quizId} onClick={() => handleSelectQuiz(q)} className={`p-4 rounded-xl border cursor-pointer transition-all ${activeQuiz?.quizId === q.quizId ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="font-bold text-sm text-gray-900">{q.title}</div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${q.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.isPublished ? 'LIVE' : 'DRAFT'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{q.description}</p>
            </div>
          ))}
          {quizzes.length === 0 && <div className="text-center text-xs text-gray-400 py-6 italic">No assessments designed yet.</div>}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[60vh]">
        {activeQuiz ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">{activeQuiz.title}</h2>
                <p className="text-sm text-gray-500">{activeQuiz.description}</p>
              </div>
              {!activeQuiz.isPublished && (
                <button onClick={() => handlePublish(activeQuiz.quizId)} className="flex items-center px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-xl">
                  <CheckCircleIcon className="h-4 w-4 mr-1" /> Go Live
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-gray-900">Test Questions ({questions.length})</h3>
              <button onClick={() => setShowQuestionForm(!showQuestionForm)} className="text-xs font-bold text-primary-600 hover:underline flex items-center">
                <PlusIcon className="h-4 w-4 mr-1" /> New Question
              </button>
            </div>

            {showQuestionForm && (
              <form onSubmit={handleQuestionSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Problem Statement</label>
                  <input required type="text" value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" placeholder="Who created Java?" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['1', '2', '3', '4'].map((num) => (
                    <div key={num}>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Choice {num}</label>
                      <input required type="text" value={questionForm[`option${num}`]} onChange={(e) => setQuestionForm({ ...questionForm, [`option${num}`]: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Correct Target Value</label>
                    <select required value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">
                      <option value="">Select One</option>
                      {questionForm.option1 && <option value={questionForm.option1}>{questionForm.option1}</option>}
                      {questionForm.option2 && <option value={questionForm.option2}>{questionForm.option2}</option>}
                      {questionForm.option3 && <option value={questionForm.option3}>{questionForm.option3}</option>}
                      {questionForm.option4 && <option value={questionForm.option4}>{questionForm.option4}</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Score Value</label>
                    <input type="number" value={questionForm.marks} onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
                  </div>
                </div>
                
                <button type="submit" className="btn-primary w-full py-2 rounded-xl text-xs font-bold">Load Problem</button>
              </form>
            )}

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.questionId || idx} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{idx + 1}. {q.text}</div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                      {q.options && q.options.map((opt, i) => (
                        <div key={i} className={opt === q.correctAnswer ? 'text-green-600 font-bold' : ''}>• {opt}</div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{q.marks} pts</span>
                </div>
              ))}
              {questions.length === 0 && <div className="text-center text-xs text-gray-400 py-20 italic">Insert modules manually.</div>}
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-md font-bold text-gray-900 mb-4">Student Performance ({attempts.length})</h3>
              <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attempts.map((att) => (
                      <tr key={att.attemptId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">#STU-{att.studentId}</td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900">{att.score}%</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${att.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {att.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleResetAttempt(att.studentId)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Reset Attempt"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {attempts.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-xs text-gray-400 italic">No students have attempted this quiz yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-sm">
            Select standard items properly.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagePage;
