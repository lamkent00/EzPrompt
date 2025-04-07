import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const checkDuplicates = async (): Promise<ValidationErrors> => {
    const errors: ValidationErrors = {};

    // Check username using a safer query approach
    const { data: existingUsernames } = await supabase
      .from('users')
      .select('username')
      .eq('username', form.username)
      .limit(1);

    if (existingUsernames && existingUsernames.length > 0) {
      errors.username = 'Tên người dùng đã được sử dụng';
    }

    // Check email using signUp's built-in validation
    // We'll let Supabase Auth handle email duplicates

    return errors;
  };

  const validateForm = async (): Promise<ValidationErrors> => {
    const errors: ValidationErrors = {};

    // Username validation
    if (!form.username) {
      errors.username = 'Tên người dùng không được để trống';
    } else if (form.username.length < 3) {
      errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      errors.username = 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    // Email validation
    if (!form.email) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!form.password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // If basic validation passes, check for duplicates
    if (Object.keys(errors).length === 0) {
      const duplicateErrors = await checkDuplicates();
      Object.assign(errors, duplicateErrors);
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form
      const validationErrors = await validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        throw new Error('Vui lòng kiểm tra lại thông tin đăng ký');
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username
          }
        }
      });

      if (authError) {
        if (authError.message.includes('email')) {
          setErrors({ email: 'Email đã được sử dụng' });
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Không thể tạo tài khoản');
      }

      // Create user profile in the public users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            username: form.username,
            email: form.email,
            role: 'user',
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        // If profile creation fails, we'll let the user try again
        // instead of trying to delete the auth user
        if (profileError.message.includes('username')) {
          setErrors({ username: 'Tên người dùng đã được sử dụng' });
          throw new Error('Tên người dùng đã được sử dụng');
        }
        
        throw new Error('Không thể tạo hồ sơ người dùng. Vui lòng thử lại.');
      }

      // Show success message
      toast.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
        { 
          duration: 6000,
          icon: '✉️'
        }
      );

      // Clear form
      // setForm({
      //   username: '',
      //   email: '',
      //   password: '',
      //   confirmPassword: ''
      // });

      // // Redirect to login
      // navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Show error message
      toast.error(
        error.message || 'Đăng ký thất bại. Vui lòng thử lại.',
        {
          duration: 4000,
          icon: '❌'
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    name: keyof typeof form,
    label: string,
    type: string,
    icon: React.ReactNode,
    placeholder: string
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={(e) => {
            setForm({ ...form, [name]: e.target.value });
            // Clear error when user starts typing
            if (errors[name]) {
              setErrors({ ...errors, [name]: undefined });
            }
          }}
          className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
            errors[name] ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Đăng ký tài khoản mới
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hoặc{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                đăng nhập với tài khoản có sẵn
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {renderInput(
                'username',
                'Tên người dùng',
                'text',
                <User className="h-5 w-5 text-gray-400" />,
                'Nhập tên người dùng'
              )}
              {renderInput(
                'email',
                'Email',
                'email',
                <Mail className="h-5 w-5 text-gray-400" />,
                'Nhập email của bạn'
              )}
              {renderInput(
                'password',
                'Mật khẩu',
                'password',
                <Lock className="h-5 w-5 text-gray-400" />,
                'Nhập mật khẩu'
              )}
              {renderInput(
                'confirmPassword',
                'Xác nhận mật khẩu',
                'password',
                <Lock className="h-5 w-5 text-gray-400" />,
                'Nhập lại mật khẩu'
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <img
                    className="h-5 w-5"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                  />
                  <span className="ml-2">Google</span>
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <img
                    className="h-5 w-5"
                    src="https://www.svgrepo.com/show/448234/facebook.svg"
                    alt="Facebook logo"
                  />
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}