import { useState } from 'react';
import Toast from '@/components/ui/Toast';
import { userAPI } from '@/shared/api/client';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const inputClass =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 pr-12';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      showMessage("Passwords don't match!", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await userAPI.create(formData);
      showMessage('Account created successfully!', 'success');
      // Clear form
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        password: '',
        confirm_password: '',
      });

      // Redirect to sign-in immediately
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Registration failed: ${message}`, 'error');
      console.error('Sign-up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
  );

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            First name
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              className={inputClass}
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Last name
            <input
              type="text"
              name="last_name"
              placeholder="Last name"
              className={inputClass}
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            className={inputClass}
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            className={inputClass}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Date of birth
          <input
            type="date"
            name="date_of_birth"
            className={inputClass}
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 relative">
          Password
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              className={inputClass}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>

        <label className="block text-sm font-medium text-slate-700 relative">
          Confirm password
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              placeholder="Repeat your password"
              className={inputClass}
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </>
  );
}
