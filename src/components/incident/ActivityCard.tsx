import React, { FC } from 'react'
import { Activity } from './IncidentDetails';
import { Lock } from 'lucide-react';

const ActivityCard: FC<Activity> = ({ title, timestamp, comment}) => {
  return (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ backgroundColor: '#F7CC5F', color: '#856D39', display: 'flex', width: 'max-content', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', padding: '4px' }}>
                <Lock size={12} />
            </div>
            <div style={{ fontSize: '12px'}}>
                <p style={{ fontWeight: 500}}>{title}</p>
                <p style={{ color: '#666'}}>{`Work notes • ${timestamp}`}</p>
            </div>
        </div>
        <p style={{ fontSize: 12}}>{comment}</p>
    </div>
  )
}

export default ActivityCard