import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Loader2,
  MapPin,
  MessageSquare,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../utils/api';

const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().nonempty("Le mot de passe est requis"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setIsLoading(true);
    try {
      const resp = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (!resp.data.tempToken) {
        setLoginError("Erreur interne : aucun token temporaire reçu.");
        return;
      }

      setUserEmail(data.email);
      setTempToken(resp.data.tempToken);
      setShowOTP(true);
    } catch (err: any) {
      if (!err.response) {
        setLoginError("Impossible de joindre le serveur. Vérifiez l'URL ou CORS.");
      } else if (err.response.status === 403) {
        setLoginError(err.response.data?.message || "Compte inactif");
      } else {
        setLoginError(err.response.data?.message || "Erreur de connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || !userEmail) {
      setLoginError("Token ou email manquant. Veuillez réessayer.");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await api.post('/auth/verify-otp', {
        email: userEmail,
        otp: otpValue,
        token: tempToken,
      });

      const jwt = resp.data.token;
      localStorage.setItem('token', jwt);

      const profileResp = await api.get('/user/profile', {
        params: { email: userEmail }
      });

      const role = resp.data.role;
      const userName = profileResp.data.name;
      localStorage.setItem('user', JSON.stringify({
        email: userEmail,
        role,
        name: userName
      }));

      if (role === 'agent') navigate('/agent/complaints');
      else if (role === 'analyst') navigate('/analyst/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Code OTP invalide");
    } finally {
      setIsLoading(false);
    }
  };

  const email = watch('email');
  const password = watch('password');
  const isFormFilled = Boolean(email && password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6a2202] to-[#844c2c] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#bc7404]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#d6a861]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 relative border border-[#d6a861]/20">
          
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <MessageSquare className="h-12 w-12 text-[#bc7404] mx-auto" />
              <MapPin className="h-8 w-8 text-[#d6a861] mx-auto mt-2 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6a2202] via-[#844c2c] to-[#bc7404] bg-clip-text text-transparent mb-3">
              CitizenSpeak
            </h1>
            <p className="text-[#757575] text-sm font-medium">Gestion des plaintes et réclamations</p>
          </div>

          {loginError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {loginError}
              </p>
            </div>
          )}

          {!showOTP ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#757575] group-focus-within:text-[#844c2c] transition-colors" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Adresse email"
                    className="w-full bg-[#F5F5F5] border-2 border-[#CCCCCC] rounded-xl pl-12 pr-4 py-4 text-[#333333] placeholder-[#757575] focus:outline-none focus:border-[#844c2c] focus:bg-white transition-all duration-200"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#757575] group-focus-within:text-[#844c2c] transition-colors" />
                  <input
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className="w-full bg-[#F5F5F5] border-2 border-[#CCCCCC] rounded-xl pl-12 pr-12 py-4 text-[#333333] placeholder-[#757575] focus:outline-none focus:border-[#844c2c] focus:bg-white transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#844c2c] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormFilled || isLoading}
                className={`w-full py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isFormFilled && !isLoading
                    ? 'bg-gradient-to-r from-[#844c2c] to-[#bc7404] hover:from-[#6a2202] hover:to-[#844c2c] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-[#CCCCCC] text-[#757575] cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#844c2c] to-[#bc7404] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <KeyRound className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#333333] mb-2">Vérification en deux étapes</h3>
                <p className="text-[#757575] text-sm">Entrez le code à 6 chiffres envoyé à votre email</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-[#F5F5F5] border-2 border-[#CCCCCC] rounded-xl px-6 py-4 text-center text-[#333333] text-2xl font-mono tracking-widest focus:outline-none focus:border-[#844c2c] focus:bg-white transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={otpValue.length !== 6 || isLoading}
                className={`w-full py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  otpValue.length === 6 && !isLoading
                    ? 'bg-gradient-to-r from-[#8B4513] to-[#bc7404] hover:from-[#6a2202] hover:to-[#8B4513] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-[#CCCCCC] text-[#757575] cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Vérification...
                  </div>
                ) : (
                  'Vérifier le code'
                )}
              </button>

              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowOTP(false);
                    setOtpValue('');
                    setLoginError(null);
                  }} 
                  className="text-[#844c2c] hover:text-[#bc7404] text-sm font-medium transition-colors hover:underline"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};