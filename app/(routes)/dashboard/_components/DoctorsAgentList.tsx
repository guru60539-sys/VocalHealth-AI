import React from 'react';
import { AIDoctorAgents } from '@/shared/list';
import DoctorsAgentCard from './DoctorsAgentCard';

function DoctorsAgentList() {
  return (
    <section className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Personalized support</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Meet your AI specialist team</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {AIDoctorAgents.map((doctor, index) => (
          <div key={index}>
            <DoctorsAgentCard doctorAgent={doctor} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default DoctorsAgentList;
