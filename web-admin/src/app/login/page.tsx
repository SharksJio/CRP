'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

// Decorative SVG Components for Kids Theme
const CloudSvg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 60" fill="currentColor">
    <ellipse cx="30" cy="40" rx="25" ry="18" />
    <ellipse cx="55" cy="35" rx="30" ry="22" />
    <ellipse cx="80" cy="42" rx="20" ry="15" />
    <ellipse cx="45" cy="45" rx="35" ry="15" />
  </svg>
);

const StarSvg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const BalloonSvg = ({ className, color }: { className?: string; color: string }) => (
  <svg className={className} viewBox="0 0 50 80" fill={color}>
    <ellipse cx="25" cy="28" rx="20" ry="25" />
    <path d="M25 53 Q27 60 25 70 Q23 80 25 80" stroke={color} strokeWidth="2" fill="none" />
    <ellipse cx="25" cy="53" rx="5" ry="3" />
  </svg>
);

const SunSvg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <circle cx="50" cy="50" r="25" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <line
        key={angle}
        x1="50"
        y1="50"
        x2={50 + 40 * Math.cos((angle * Math.PI) / 180)}
        y2={50 + 40 * Math.sin((angle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

const RainbowSvg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 100">
    <path d="M10 100 Q10 10 100 10 Q190 10 190 100" fill="none" stroke="#F87171" strokeWidth="12" />
    <path d="M25 100 Q25 25 100 25 Q175 25 175 100" fill="none" stroke="#FFD93D" strokeWidth="12" />
    <path d="M40 100 Q40 40 100 40 Q160 40 160 100" fill="none" stroke="#4ADE80" strokeWidth="12" />
    <path d="M55 100 Q55 55 100 55 Q145 55 145 100" fill="none" stroke="#60A5FA" strokeWidth="12" />
    <path d="M70 100 Q70 70 100 70 Q130 70 130 100" fill="none" stroke="#A855F7" strokeWidth="12" />
  </svg>
);

// Cute child illustration
const ChildIllustration = ({ className, variant }: { className?: string; variant: 'boy' | 'girl' }) => (
  <svg className={className} viewBox="0 0 80 120">
    {variant === 'boy' ? (
      <>
        {/* Boy - Blue outfit */}
        <circle cx="40" cy="30" r="22" fill="#FECACA" /> {/* Head */}
        <ellipse cx="40" cy="85" rx="18" ry="25" fill="#60A5FA" /> {/* Body */}
        <circle cx="32" cy="26" r="3" fill="#374151" /> {/* Left eye */}
        <circle cx="48" cy="26" r="3" fill="#374151" /> {/* Right eye */}
        <path d="M36 36 Q40 42 44 36" stroke="#374151" strokeWidth="2" fill="none" /> {/* Smile */}
        <ellipse cx="40" cy="12" rx="20" ry="10" fill="#8B5CF6" /> {/* Hair */}
        <ellipse cx="24" cy="85" rx="6" ry="15" fill="#60A5FA" /> {/* Left arm */}
        <ellipse cx="56" cy="85" rx="6" ry="15" fill="#60A5FA" /> {/* Right arm */}
        <ellipse cx="32" cy="112" rx="7" ry="10" fill="#3B82F6" /> {/* Left leg */}
        <ellipse cx="48" cy="112" rx="7" ry="10" fill="#3B82F6" /> {/* Right leg */}
      </>
    ) : (
      <>
        {/* Girl - Pink outfit */}
        <circle cx="40" cy="30" r="22" fill="#FECACA" /> {/* Head */}
        <ellipse cx="40" cy="85" rx="22" ry="25" fill="#FF6B9D" /> {/* Dress */}
        <circle cx="32" cy="26" r="3" fill="#374151" /> {/* Left eye */}
        <circle cx="48" cy="26" r="3" fill="#374151" /> {/* Right eye */}
        <path d="M36 36 Q40 42 44 36" stroke="#374151" strokeWidth="2" fill="none" /> {/* Smile */}
        <path d="M20 25 Q25 5 40 8 Q55 5 60 25" fill="#FFD93D" /> {/* Hair */}
        <circle cx="22" cy="18" r="8" fill="#FFD93D" /> {/* Left pigtail */}
        <circle cx="58" cy="18" r="8" fill="#FFD93D" /> {/* Right pigtail */}
        <ellipse cx="18" cy="80" rx="5" ry="12" fill="#FECACA" /> {/* Left arm */}
        <ellipse cx="62" cy="80" rx="5" ry="12" fill="#FECACA" /> {/* Right arm */}
        <ellipse cx="32" cy="112" rx="7" ry="10" fill="#EC4899" /> {/* Left leg */}
        <ellipse cx="48" cy="112" rx="7" ry="10" fill="#EC4899" /> {/* Right leg */}
      </>
    )}
  </svg>
);

// School/Book illustration
const SchoolIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    {/* Book base */}
    <path d="M15 25 L50 15 L85 25 L85 85 L50 95 L15 85 Z" fill="#60A5FA" />
    <path d="M50 15 L50 95" stroke="#3B82F6" strokeWidth="3" />
    {/* Book pages */}
    <path d="M20 30 L48 22 L48 88 L20 80 Z" fill="#DBEAFE" />
    <path d="M80 30 L52 22 L52 88 L80 80 Z" fill="#DBEAFE" />
    {/* ABC text */}
    <text x="28" y="55" fill="#3B82F6" fontSize="14" fontWeight="bold">A</text>
    <text x="33" y="70" fill="#EC4899" fontSize="14" fontWeight="bold">B</text>
    <text x="60" y="55" fill="#4ADE80" fontSize="14" fontWeight="bold">C</text>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-kids-sky via-kids-mint to-kids-cream flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Decorations */}
      
      {/* Sun */}
      <SunSvg className="absolute top-8 right-12 w-24 h-24 text-kids-yellow animate-wiggle" />
      
      {/* Clouds */}
      <CloudSvg className="absolute top-16 left-8 w-32 h-20 text-white opacity-90 animate-float" />
      <CloudSvg className="absolute top-32 right-32 w-24 h-14 text-white opacity-80 animate-float-delayed" />
      <CloudSvg className="absolute top-8 left-1/3 w-20 h-12 text-white opacity-70 animate-float-slow" />
      
      {/* Rainbow */}
      <RainbowSvg className="absolute bottom-0 left-0 w-64 h-32 opacity-60" />
      
      {/* Balloons */}
      <div className="absolute top-20 left-16 animate-float">
        <BalloonSvg className="w-10 h-16" color="#FF6B9D" />
      </div>
      <div className="absolute top-32 right-20 animate-float-delayed">
        <BalloonSvg className="w-8 h-14" color="#FFD93D" />
      </div>
      <div className="absolute bottom-40 left-12 animate-float-slow">
        <BalloonSvg className="w-9 h-16" color="#A855F7" />
      </div>
      
      {/* Stars */}
      <StarSvg className="absolute top-40 right-8 w-8 h-8 text-kids-yellow animate-wiggle" />
      <StarSvg className="absolute bottom-32 right-16 w-6 h-6 text-kids-orange animate-wiggle" />
      <StarSvg className="absolute top-1/4 left-8 w-5 h-5 text-kids-pink animate-wiggle" />
      
      {/* Child Illustrations */}
      <div className="absolute bottom-0 left-8 hidden lg:block animate-float-slow">
        <ChildIllustration className="w-24 h-36" variant="girl" />
      </div>
      <div className="absolute bottom-0 right-8 hidden lg:block animate-float-delayed">
        <ChildIllustration className="w-24 h-36" variant="boy" />
      </div>

      {/* Grass */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-kids-green rounded-t-full" />

      {/* Main Content */}
      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-6">
          {/* School Book Icon */}
          <div className="w-28 h-28 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-kids-yellow rounded-full animate-pulse opacity-30" />
            <SchoolIcon className="w-full h-full relative z-10 animate-wiggle" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Kitties powered by Droidminnds</h1>
          <p className="text-gray-600 mt-1">Welcome back! Sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-4xl shadow-xl p-8 border-4 border-kids-yellow relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute -top-3 -left-3 w-10 h-10 bg-kids-pink rounded-full" />
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-kids-blue rounded-full" />
          <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-kids-green rounded-full" />
          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-kids-purple rounded-full" />

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">📧</span> Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm bg-kids-cream/50 border-2 border-kids-blue/30 rounded-2xl placeholder:text-gray-400 focus:border-kids-blue focus:ring-2 focus:ring-kids-blue/20 transition-all duration-200"
                  placeholder="admin@demopreschool.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">🔒</span> Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 text-sm bg-kids-cream/50 border-2 border-kids-pink/30 rounded-2xl placeholder:text-gray-400 focus:border-kids-pink focus:ring-2 focus:ring-kids-pink/20 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-kids-purple transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-kids-peach/50 border-2 border-kids-red/30 rounded-2xl p-3 flex items-center gap-2 animate-fade-in">
                <span className="text-lg">😕</span>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base font-bold text-white bg-gradient-to-r from-kids-pink via-kids-purple to-kids-blue rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Let&apos;s Go!</span>
                  <span>🎉</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t-2 border-dashed border-kids-yellow">
            <div className="bg-gradient-to-r from-kids-mint/50 to-kids-lavender/50 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎪</span>
                <span className="text-sm font-bold text-gray-700">Demo Playground</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-semibold text-kids-purple">Email:</span> admin@demopreschool.com</p>
                <p><span className="font-semibold text-kids-pink">Password:</span> Admin@123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 Kitties powered by Droidminnds Management System
        </p>
      </div>
    </div>
  );
}
