// src/pages/notices/CreateNotice.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import NoticeForm from '@/components/notices/NoticeForm';

const CreateNotice = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/notices');
  };

  const handleCancel = () => {
    navigate('/notices');
  };

  return (
    <div>
      <NoticeForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default CreateNotice;
