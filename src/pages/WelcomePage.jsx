import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Layout from '../components/Layout'

export default function WelcomePage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            🎉
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">登録が完了しました！</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            メールアドレスの確認が完了しました。<br />
            Asobixへようこそ！様々なゲームをプレイ・投稿して楽しんでください。
          </p>
          <Link
            to={ROUTES.HOME}
            className="inline-block px-8 py-3.5 w-full bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </Layout>
  )
}
