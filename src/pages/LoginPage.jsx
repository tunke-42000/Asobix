import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/errorMessages'
import { validateLoginForm } from '../utils/validation'
import Layout from '../components/Layout'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return
    setErrorMessage('')

    const valErr = validateLoginForm(form)
    if (valErr) {
      setErrorMessage(valErr)
      return
    }

    setIsSubmitting(true)
    try {
      await signIn(form.email, form.password)
      navigate(ROUTES.MYPAGE)
    } catch (err) {
      console.error("Supabase login error:", err)
      setErrorMessage(getErrorMessage(err, MESSAGES.ERROR.LOGIN))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h1>
        <p className="text-sm text-gray-500 mb-8">アカウントにサインインする</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          {errorMessage && (
            <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="パスワードを入力"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          アカウントをお持ちでない方は{' '}
          <Link to={ROUTES.REGISTER} className="text-blue-500 hover:underline font-medium">
            新規登録
          </Link>
        </p>
      </div>
    </Layout>
  )
}
