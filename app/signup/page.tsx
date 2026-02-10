import { SignupForm } from './signup-form'

export default function SignupPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-100/50 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 sm:text-5xl">
            開始您的旅程
          </h1>
          <p className="mt-2 text-lg text-slate-600 font-medium">
            探索台灣最動人的角落
          </p>
        </div>
        
        <SignupForm />
        
        <p className="mt-8 text-sm text-slate-400">
          © 2026 Taiwan Scenic Slow Travel. All rights reserved.
        </p>
      </div>
    </div>
  )
}
