import React, { useState } from 'react';
import axios from 'axios';

const CreatePaste = () => {
  const [content, setContent] = useState('');
  const [expiry, setExpiry] = useState('');
  const [viewsLimit, setViewsLimit] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/pastes', {
        content,
        expiry,
        viewsLimit,
      });
      const url = `${window.location.origin}/paste/${response.data.id}`;
      console.log('Generated paste ID:', response.data.id);
      console.log('Generated URL:', url);
      setPasteUrl(url);
    } catch (error) {
      console.error('Error creating paste', error);
    }
  };

  return (
    <div className="paste-container">
      <h1>Create New Paste</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your text here..."
        ></textarea>
        
        <div className="input-row">
          <label>
            Expiry (seconds):
            <input
              type="number"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </label>
          
          <label>
            View Limit:
            <input
              type="number"
              value={viewsLimit}
              onChange={(e) => setViewsLimit(e.target.value)}
            />
          </label>
          
          <button type="submit" className="create-btn">Create Paste</button>
        </div>
      </form>
      
      {pasteUrl && (
        <div className="url-display">
          <h3>Shareable URL:</h3>
          <input 
            type="text" 
            value={pasteUrl} 
            readOnly 
          />
          <button 
            onClick={() => navigator.clipboard.writeText(pasteUrl)}
            className="copy-btn"
          >
            Copy URL
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatePaste;

