import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/shared/components/Toast';
import { userAPI } from '@/features/user/services/user.service';
import { EyeIcon, EyeOffIcon, GoogleIcon } from '@/shared/icons';
import { googleLogin } from '@/features/auth/services/auth.service';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { StaggerContainer, StaggerItem } from '@/shared/components/animations/StaggerContainer';

interface Props {
  onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });
  const router = useRouter();

  const getInputClass = (fieldName: string) => {
    return `mt-2 w-full rounded-2xl border ${fieldErrors[fieldName] ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 focus:ring-emerald-500/50'} px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur-sm outline-none transition-all focus:bg-white dark:focus:bg-black focus:ring-2 focus:shadow-md ${fieldName.includes('password') ? 'pr-12' : ''}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      try {
        await googleLogin(tokenResponse.access_token);
        showMessage('Google account connected successfully!', 'success');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      } catch (error: unknown) {
        showMessage((error as Error).message || 'Google signup failed', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => showMessage('Google signup failed', 'error'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const errors: Record<string, string> = {};
    if (!formData.first_name) errors.first_name = 'Please enter your first name';
    if (!formData.last_name) errors.last_name = 'Please enter your last name';
    if (!formData.username) errors.username = 'Please choose a username';
    if (!formData.email) errors.email = 'Please enter your email';
    if (!formData.date_of_birth) errors.date_of_birth = 'Please enter your date of birth';
    if (!formData.password) errors.password = 'Please create a password';
    
    if (formData.password && formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords don't match!";
    } else if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      
      const submitData = { ...formData } as Partial<typeof formData>;
      delete submitData.confirm_password;
      await userAPI.create(submitData);
      showMessage('Account created successfully!', 'success');
      
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        password: '',
        confirm_password: '',
      });

      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Unknown error';
      showMessage(`Registration failed: ${message}`, 'error');
      console.error('Sign-up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <StaggerContainer as="form" className="space-y-4" onSubmit={handleSubmit} noValidate>
        <StaggerItem className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-foreground">
            First name
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              className={getInputClass('first_name')}
              value={formData.first_name}
              onChange={handleChange}
            />
            {fieldErrors.first_name && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.first_name}</span>}
          </label>
          <label className="block text-sm font-medium text-foreground">
            Last name
            <input
              type="text"
              name="last_name"
              placeholder="Last name"
              className={getInputClass('last_name')}
              value={formData.last_name}
              onChange={handleChange}
            />
            {fieldErrors.last_name && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.last_name}</span>}
          </label>
        </StaggerItem>

        <StaggerItem className="block text-sm font-medium text-foreground">
          Username
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            className={getInputClass('username')}
            value={formData.username}
            onChange={handleChange}
          />
          {fieldErrors.username && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.username}</span>}
        </StaggerItem>

        <StaggerItem className="block text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            className={getInputClass('email')}
            value={formData.email}
            onChange={handleChange}
          />
          {fieldErrors.email && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.email}</span>}
        </StaggerItem>

        <StaggerItem className="block text-sm font-medium text-foreground">
          Date of birth
          <input
            type="date"
            name="date_of_birth"
            className={getInputClass('date_of_birth')}
            value={formData.date_of_birth}
            onChange={handleChange}
          />
          {fieldErrors.date_of_birth && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.date_of_birth}</span>}
        </StaggerItem>

        <StaggerItem className="block text-sm font-medium text-foreground relative">
          Password
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              className={getInputClass('password')}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.password && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.password}</span>}
        </StaggerItem>

        <StaggerItem className="block text-sm font-medium text-foreground relative">
          Confirm password
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              placeholder="Repeat your password"
              className={getInputClass('confirm_password')}
              value={formData.confirm_password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.confirm_password && <span className="mt-1 block text-xs text-red-500 font-medium">{fieldErrors.confirm_password}</span>}
        </StaggerItem>

        <StaggerItem>
          <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="mt-2 w-full"
          variant="primary"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </StaggerItem>

        <StaggerItem className="relative flex items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-400 mt-4 mb-4">
          <span className="absolute left-0 right-0 top-1/2 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="relative bg-white/80 dark:bg-black/80 backdrop-blur-sm px-3 rounded-full">or</span>
        </StaggerItem>

        <StaggerItem>
          <Button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isSubmitting}
          className="w-full"
          variant="outline"
          leftIcon={<GoogleIcon />}
        >
          Sign up with Google
          </Button>
        </StaggerItem>
      </StaggerContainer>
    </>
  );
}
