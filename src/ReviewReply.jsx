import React, { useState } from 'react';
import './ReviewReply.css';

const ReviewReply = ({ reviewId, onReplySubmitted, establishmentId }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          content: replyText,
          establishmentId
        })
      });

      if (!response.ok) throw new Error('Failed to submit reply');

      const data = await response.json();
      onReplySubmitted(data);
      setReplyText('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="review-reply-form" onSubmit={handleSubmit}>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write your reply..."
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Reply'}
      </button>
    </form>
  );
};

export default ReviewReply;