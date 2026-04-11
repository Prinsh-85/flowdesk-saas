import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const TaskDetails = ({ task, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>Description</h4>
            <p>{task.description || 'No description provided.'}</p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <div className="detail-section">
              <h4>Status</h4>
              <p style={{ textTransform: 'capitalize' }}>{task.status}</p>
            </div>
            <div className="detail-section">
              <h4>Priority</h4>
              <p style={{ textTransform: 'capitalize' }}>{task.priority || 'Medium'}</p>
            </div>
          </div>
          
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
