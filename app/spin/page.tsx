'use client';

import SpinWheel from '@/components/SpinWheel';

export default function SpinPage() {
  return (
    <div className="py-12 text-center">
      <span className="chip mx-auto mb-4 inline-flex">Bonus</span>
      <h1 className="text-3xl font-bold heading-gradient">Spin the Wheel</h1>
      <p className="text-muted mx-auto mt-2 max-w-md">
        Not sure where to start? Let the wheel pick a random topic for your next quiz.
      </p>
      <div className="mt-10">
        <SpinWheel />
      </div>
    </div>
  );
}
