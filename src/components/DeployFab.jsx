import React from 'react';
import { Rocket } from 'lucide-react';

export default function DeployFab({ onClick }) {
  return (
    <div className="deploy-floating">
      <button className="deploy-fab" onClick={onClick}>
        <Rocket size={16} /> Deploy
      </button>
    </div>
  );
}
