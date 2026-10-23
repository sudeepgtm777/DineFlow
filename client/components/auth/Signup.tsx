// @ts-nocheck
import React, { useEffect } from 'react';
import { Link, useNavigate } from '@/lib/router';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useSignup from '@/hooks/auth/useSignup';

const Signup = () => {
  const { loading, submitHandler } = useSignup();
  const { user } = useSelector((store: any) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const formik = useFormik({
    initialValues: {
      fullname: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: '',
      image: null,
    },
    validationSchema: Yup.object({
      fullname: Yup.string()
        .min(3, 'Too short')
        .max(50, 'Too long')
        .required('Full name is required'),
      email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
      phoneNumber: Yup.string()
        .matches(/^[0-9]{10}$/, 'Invalid phone number')
        .required('Phone number is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      role: Yup.string().required('Role is required'),
      image: Yup.mixed().nullable(),
    }),
    onSubmit: submitHandler,
  });

  return (
    <div className='flex items-center justify-center max-w-7xl mx-auto'>
      <form
        onSubmit={formik.handleSubmit}
        className='w-1/2 border border-gray-200 rounded-md p-4 my-10'
      >
        <h1 className='font-bold text-xl mb-5'>Sign Up</h1>

        {['fullname', 'email', 'phoneNumber', 'password'].map((field) => (
          <div className='my-2' key={field}>
            <label htmlFor={field} className='block capitalize'>
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              id={field}
              name={field}
              value={formik.values[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={`Enter ${field}`}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className='text-red-500 text-sm'>{formik.errors[field]}</p>
            )}
          </div>
        ))}

        {/* Role Selection - Remove admin option */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4 my-5'>
            <div className='flex items-center space-x-2'>
              <input
                type='radio'
                id='cook'
                name='role'
                value='cook'
                checked={formik.values.role === 'cook'}
                onChange={formik.handleChange}
                className='cursor-pointer'
              />
              <label htmlFor='cook' className='capitalize'>
                Cook
              </label>
            </div>
          </div>
          {formik.touched.role && formik.errors.role && (
            <p className='text-red-500 text-sm'>{formik.errors.role}</p>
          )}

          {/* Profile Image Upload */}
          <div className='flex items-center gap-2'>
            <label htmlFor='profile'>Profile</label>
            <input
              accept='image/*'
              type='file'
              id='profile'
              name='image'
              onChange={(event) =>
                formik.setFieldValue('image', event.currentTarget.files[0])
              }
              className='cursor-pointer'
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='w-full my-4 bg-blue-600 text-white py-2 rounded-md'
          disabled={formik.isSubmitting || loading}
        >
          {formik.isSubmitting || loading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            'Signup'
          )}
        </button>

        <span className='text-sm'>
          Already have an account?{' '}
          <Link to='/login' className='text-blue-600'>
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
