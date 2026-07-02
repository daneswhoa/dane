import React from 'react';

export default function ValueProposition() {
  return (
    <section className="py-32 px-6 max-w-4xl mx-auto relative border-b border-white/5">
      <div className="absolute left-[-100px] top-[20%] w-[300px] h-[400px] blur-blob blob-coral opacity-25 transform -rotate-45 parallax-bg" data-speed="0.1"></div>
      <div className="absolute right-[-100px] top-[20%] w-[300px] h-[400px] blur-blob blob-primary opacity-25 transform rotate-45 parallax-bg" data-speed="0.2"></div>

      <div className="space-y-12 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto text-center md:text-left scroll-trigger">
        <p className="text-paper-300 reveal-up">
          If a maintenance request moves in <span className="text-white">one place</span>, it moves everywhere. <br />
          Use built-in triggers to automate status updates, <br />
          <span className="text-primary relative inline-block group cursor-default">
            contractor notifications
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </span>, and{' '}
          <span className="text-coral relative inline-block group cursor-default">
            invoice dispatching
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-coral transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </span>
        </p>

        <p className="text-paper-300 reveal-up delay-100">
          without writing a single line of complex code.
        </p>

        <p className="text-dark-500 hover:text-paper-300 transition-colors duration-500 cursor-default reveal-up delay-200">
          Check your portfolio's progress at a glance.
        </p>

        <p className="text-paper-300 reveal-up delay-300">
          You can see <span className="text-primary font-semibold">who is busy</span>, which repairs are done, and <br />
          <span className="text-coral font-semibold">what rent needs to be collected next.</span>
        </p>

        <p className="text-dark-500 hover:text-paper-300 transition-colors duration-500 cursor-default reveal-up delay-400">
          No more guessing if your properties are yielding returns.
        </p>
      </div>
    </section>
  );
}
