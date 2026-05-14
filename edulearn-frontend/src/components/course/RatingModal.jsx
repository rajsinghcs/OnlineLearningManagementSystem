import React, { useState, useEffect } from 'react';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { courseApi } from '../../api/courseApi';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, courseId, studentId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && courseId && studentId) {
      const fetchExistingRating = async () => {
        try {
          const res = await courseApi.getRatingByCourseAndStudent(courseId, studentId);
          if (res.data) {
            setRating(res.data.ratingValue);
            setComment(res.data.comment || '');
          }
        } catch (err) {
          // No existing rating, that's fine
        }
      };
      fetchExistingRating();
    } else {
      setRating(0);
      setComment('');
    }
  }, [isOpen, courseId, studentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await courseApi.submitRating({
        courseId,
        studentId,
        ratingValue: rating,
        comment
      });
      toast.success('Rating submitted successfully!');
      onRatingSubmitted();
      onClose();
    } catch (err) {
      console.error('Failed to submit rating', err);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Rate this Course</h3>
            <p className="text-gray-500 font-medium mt-2">How was your learning experience?</p>
          </div>

          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                {star <= (hover || rating) ? (
                  <StarIconSolid className="h-10 w-10 text-amber-400 shadow-sm" />
                ) : (
                  <StarIconOutline className="h-10 w-10 text-gray-200" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Review (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all min-h-[100px]"
                placeholder="What did you like or dislike?"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 px-6 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Save Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
