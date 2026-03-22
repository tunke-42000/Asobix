import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/errorMessages'
import { validateRegisterForm } from '../utils/validation'
import Layout from '../components/Layout'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return
    setErrorMessage('')

    const valErr = validateRegisterForm(form)
    if (valErr) {
      setErrorMessage(valErr)
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(form.email, form.password, form.username)
      setSuccess(true)
    } catch (err) {
      console.error("Supabase signup error:", err)
      setErrorMessage(getErrorMessage(err, MESSAGES.ERROR.REGISTER))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">新規登録</h1>
        <p className="text-sm text-gray-500 mb-8">
          アカウントを作成してゲームを投稿しましょう
        </p>

        {success ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ✨
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">確認メールを送信しました</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              ご登録いただいたメールアドレスに確認メールを送信しました。<br />
              メール内のリンクをクリックして登録を完了してください。
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block px-6 py-3 w-full bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
            >
              ログイン画面へ進む
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            {errorMessage && (
              <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ユーザー名 *</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="例: Tanaka"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="6文字以上"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-center text-sm text-gray-500 mt-6">
            すでにアカウントをお持ちですか？{' '}
            <Link to={ROUTES.LOGIN} className="text-blue-500 hover:underline font-medium">
              ログイン
            </Link>
          </p>
        )}
      </div>
    </Layout>
  )
}
