import React, { useState, useEffect } from 'react';

interface Props {
  isActive: boolean;
  progress: number; // 0 to 100
  threads: number;
}

export const AttackProgressMonitor: React.FC<Props> = ({ isActive, progress, threads }) => {
  if (!isActive) return null;

  return (
    <div className="attack-monitor p-4 border rounded shadow-md bg-gray-900 text-green-400">
      <h3 className="font-bold text-lg mb-2">Cryptanalytic Attack in Progress...</h3>
      <p>Active Worker Threads: {threads}</p>
      <div className="w-full bg-gray-700 rounded h-4 mt-2">
        <div 
          className="bg-green-500 h-4 rounded transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-right text-sm">{progress.toFixed(2)}% Complete</p>
    </div>
  );
};
