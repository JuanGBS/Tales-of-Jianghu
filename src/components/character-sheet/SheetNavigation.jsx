// ARQUIVO: src/components/character-sheet/SheetNavigation.jsx

import React from 'react';
import { UserCircleIcon, SparklesIcon, ArrowTrendingUpIcon, ArchiveBoxIcon, BoltIcon } from '@heroicons/react/24/solid';

function SheetNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'sheet', label: 'Ficha', icon: UserCircleIcon },
    { id: 'techniques', label: 'Técnicas', icon: SparklesIcon },
    { id: 'inventory', label: 'Equipamento', icon: ArchiveBoxIcon },
    { id: 'combat', label: 'Combate', icon: BoltIcon },
    { id: 'progression', label: 'Progressão', icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 z-50">
      <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
                isActive ? 'bg-brand-primary text-brand-text' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SheetNavigation;