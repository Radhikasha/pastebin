import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewPaste = () => {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        // Decode the ID to handle special characters
        const decodedId = decodeURIComponent(id);
        console.log('Original ID from URL:', id);
        console.log('Decoded ID:', decodedId);
        
        const response = await axios.get(`/api/pastes/${decodedId}`);
        setPaste(response.data);
      } catch (err) {
        setError('Paste not found or has expired.');
      }
    };
    fetchPaste();
  }, [id]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!paste) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="paste-container">
      <pre>{paste.content}</pre>
    </div>
  );
};

export default ViewPaste;

