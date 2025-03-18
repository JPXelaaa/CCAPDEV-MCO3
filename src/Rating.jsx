import { useState } from 'react';

function Rating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'text-warning' : 'text-secondary'} style={{ fontSize: '2rem' }}>
        ★
      </span>
    );
  }
  return <div>{stars}</div>;
}

export default Rating;