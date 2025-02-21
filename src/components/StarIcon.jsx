import React from 'react';

const StarIcon = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14.944 8.0979L22.4127 8.2008L16.5361 12.3013L18.2656 19.4992L12 15.8L5.73436 19.4992L7.4639 12.3013L1.58733 8.2008L9.056 8.0979L12 2Z"
      fill="currentColor"
      strokeWidth="1"
      stroke="currentColor"
    />
  </svg>
);

export default StarIcon; 