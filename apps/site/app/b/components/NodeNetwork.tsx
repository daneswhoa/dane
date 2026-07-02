import React from 'react';

export default function NodeNetwork() {
  const nodes = [
    { label: 'Reports', height: '200px', left: '10%' },
    { label: 'Files', height: '120px', left: '20%' },
    { label: 'Dashboard', height: '180px', left: '28%' },
    { label: 'Integrations', height: '140px', left: '36%' },
    { label: 'Projects', height: '220px', left: '45%' },
    { label: 'Calendar', height: '100px', left: '52%' },
    { label: 'Tasks', height: '250px', left: '60%', active: true },
    { label: 'Teams', height: '190px', left: '68%' },
    { label: 'Insights', height: '130px', left: '75%' },
    { label: 'Automation', height: '260px', left: '82%' },
    { label: 'Security', height: '160px', left: '90%' },
    { label: 'Analytics', height: '300px', left: '95%' },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full h-[300px] z-0 pointer-events-none">
      <div className="scroll-trigger" data-stagger="true">
        {nodes.map((node, idx) => (
          <div key={idx} className="node-wrapper absolute flex flex-col items-center" style={{ left: node.left, bottom: 0, height: node.height }}>
            <span className="text-[10px] text-paper-300 mb-2 absolute top-[-20px] whitespace-nowrap opacity-0 transition-opacity duration-500 delay-[1200ms]">
              {node.label}
            </span>
            <div className="node-line h-full" style={node.active ? { background: 'linear-gradient(to top, #E95D2A, transparent)' } : undefined}>
              <div className="node-dot" style={node.active ? { backgroundColor: '#E95D2A', boxShadow: '0 0 15px #E95D2A' } : undefined}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
