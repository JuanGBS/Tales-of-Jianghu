// src/components/CalculatedStats.jsx
import React from 'react';

function CalculatedStats({ stats }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-brand-text mb-3">Estatísticas Iniciais</h3>
      <div className="flex justify-around items-center text-center">
        <div>
          <span className="block text-sm text-gray-500">PV</span>
          <span className="block text-3xl font-bold text-green-600">{stats.maxHp}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Chi</span>
          <span className="block text-3xl font-bold text-blue-500">{stats.maxChi}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">CA</span>
          <span className="block text-3xl font-bold text-red-600">{stats.armorClass}</span>
        </div>
      </div>
    </div>
  );
}

export default CalculatedStats;