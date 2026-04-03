import { motion } from 'motion/react';

export default function Resume() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="px-6 lg:px-20 pt-32 pb-16 max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-4xl lg:text-6xl tracking-[1px] mb-16">Résumé</h1>
        
        <div className="space-y-20">
          <section>
            <h2 className="text-lg tracking-[1px] mb-10 border-b border-ink/5 pb-4">Experience</h2>
            <div className="space-y-12">
              {[
                { company: 'Independent Studio', role: 'Creative Developer', period: '2020 — Present' },
                { company: 'thatgamecompany', role: 'Lead Designer', period: '2006 — 2012' },
                { company: 'Interactive Arts Lab', role: 'Researcher', period: '2004 — 2006' }
              ].map((job, i) => (
                <div key={i} className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium">{job.company}</h3>
                    <p className="text-muted text-sm uppercase tracking-[1px] mt-1">{job.role}</p>
                  </div>
                  <span className="text-[10px] tracking-[2px] text-muted uppercase">{job.period}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg tracking-[1px] mb-10 border-b border-ink/5 pb-4">Education</h2>
            <div className="space-y-12">
              {[
                { school: 'University of Southern California', degree: 'MFA in Interactive Media', period: '2004 — 2006' },
                { school: 'Tsinghua University', degree: 'BS in Computer Science', period: '1999 — 2003' }
              ].map((edu, i) => (
                <div key={i} className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium">{edu.school}</h3>
                    <p className="text-muted text-sm uppercase tracking-[1px] mt-1">{edu.degree}</p>
                  </div>
                  <span className="text-[10px] tracking-[2px] text-muted uppercase">{edu.period}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
