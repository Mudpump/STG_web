
import React, { useState } from 'react';
import { X, GraduationCap, Mail, Lock, User, AlertCircle, CheckCircle2, BookOpen, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { GradeType } from '../types';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, loginWithEmail, signupWithEmail, checkNickname } = useStore();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState<GradeType>('H1'); // Default to H1
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nickname Check State
  const [nicknameChecked, setNicknameChecked] = useState<boolean | null>(null); // null: not checked, true: available, false: duplicate
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(e.target.value);
      setNicknameChecked(null); // Reset check on input change
  };

  const handleCheckNickname = async () => {
      if (!nickname.trim()) {
          setError('닉네임을 입력해주세요.');
          return;
      }
      setIsCheckingNickname(true);
      setError('');
      try {
          const isAvailable = await checkNickname(nickname.trim());
          setNicknameChecked(isAvailable);
          if (!isAvailable) {
              setError('이미 사용 중인 닉네임입니다. (AI 에이전트 포함)');
          }
      } catch (e) {
          setError('중복 확인 중 오류가 발생했습니다.');
      } finally {
          setIsCheckingNickname(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'SIGNUP') {
        if (!nickname.trim()) {
            throw new Error('닉네임을 입력해주세요.');
        }
        if (nicknameChecked === false) {
            throw new Error('이미 사용 중인 닉네임입니다.');
        }
        if (nicknameChecked === null) {
            throw new Error('닉네임 중복 확인을 해주세요.');
        }
        if (password !== confirmPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        await signupWithEmail(email, password, nickname, grade);
      } else {
        await loginWithEmail(email, password);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    setGrade('H1');
    setError('');
    setNicknameChecked(null);
    setMode('LOGIN');
  }

  const handleClose = () => {
    resetForm();
    closeLoginModal();
  }

  const grades: { value: GradeType, label: string }[] = [
      { value: 'MIDDLE', label: '중등' },
      { value: 'H1', label: '고1' },
      { value: 'H2', label: '고2' },
      { value: 'H3', label: '고3' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative z-10 transform transition-all scale-100 animate-fade-in-up">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 transform -rotate-6">
            <GraduationCap size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {mode === 'LOGIN' ? '세특각 로그인' : '세특각 회원가입'}
          </h2>
          <p className="text-gray-500 text-sm">
            {mode === 'LOGIN' ? '선배들의 생기부 꿀팁을 훔쳐보세요!' : '3초만에 가입하고 입시 정보를 확인하세요.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'SIGNUP' && (
                <>
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="닉네임 (활동명)"
                                value={nickname}
                                onChange={handleNicknameChange}
                                className={`w-full bg-gray-50 border rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all ${
                                    nicknameChecked === true ? 'border-green-500 ring-1 ring-green-500' :
                                    nicknameChecked === false ? 'border-red-500 ring-1 ring-red-500' :
                                    'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
                                }`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleCheckNickname}
                            disabled={isCheckingNickname || !nickname.trim()}
                            className={`px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                                nicknameChecked === true
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {isCheckingNickname ? (
                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : nicknameChecked === true ? (
                                <>
                                    <CheckCircle2 size={14} />
                                    <span>사용가능</span>
                                </>
                            ) : (
                                '중복확인'
                            )}
                        </button>
                    </div>

                    {/* Grade Selector */}
                    <div className="relative">
                        <BookOpen size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                        <div className="flex gap-2 pl-10">
                            {grades.map((g) => (
                                <button
                                    key={g.value}
                                    type="button"
                                    onClick={() => setGrade(g.value)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                        grade === g.value
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
            
            <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                    type="email"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
            </div>

            <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                    type="password"
                    placeholder="비밀번호 (6자리 이상)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
            </div>

            {mode === 'SIGNUP' && (
                <div className="relative">
                    <CheckCircle2 size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                        type="password"
                        placeholder="비밀번호 재확인"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
            )}

            {error && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs px-1">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    mode === 'LOGIN' ? '이메일로 로그인' : '회원가입 완료'
                )}
            </button>
        </form>

        <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100"></div>
            <span className="text-xs text-gray-400 font-medium">또는</span>
            <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <button 
          onClick={() => { loginWithGoogle(); }}
          type="button"
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          <span>Google로 계속하기</span>
        </button>
        
        <div className="mt-6 text-center text-sm text-gray-600">
            {mode === 'LOGIN' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button 
                onClick={() => { setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); }}
                className="ml-2 text-primary font-bold hover:underline"
            >
                {mode === 'LOGIN' ? '회원가입' : '로그인'}
            </button>
        </div>

      </div>
    </div>
  );
};
