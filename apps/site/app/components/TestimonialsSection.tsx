import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Portfolio Manager, PMG', text: 'Sophia automated 80% of our tenant maintenance calls last month. The time saved is unbelievable.', rating: 5 },
    { name: 'David Koeman', role: 'Private Landlord', text: 'Stripe splitting makes transfers to property owners instant. Best dashboard in the industry.', rating: 5 },
    { name: 'Elena Rostova', role: 'Operations Lead, Apex', text: 'The billing interface is clean and straightforward. Partial rent tracking works like a charm.', rating: 5 },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 mb-20">
      <div className="badge mb-4">Testimonials</div>
      <h2 className="text-3xl md:text-4xl font-semibold mb-10 text-white">Success Stories <span className="font-serif italic font-normal text-paper-300">from Our Users</span></h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between h-56 hover:border-white/10 transition-colors">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
              </div>
              <p className="text-sm text-paper-200 italic mb-6 leading-relaxed">"{t.text}"</p>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <h5 className="font-semibold text-white text-xs">{t.name}</h5>
                <p className="text-[10px] text-paper-300 mt-0.5">{t.role}</p>
              </div>
              <Quote className="w-5 h-5 text-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
