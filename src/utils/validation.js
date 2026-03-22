export function validateGameForm(form, thumbnailPreview, isEdit = false) {
  if (!form.title.trim()) return 'タイトルを入力してください'
  if (!form.shortDescription.trim()) return '短い説明を入力してください'
  if (!form.gameUrl.trim()) return 'ゲームURLを入力してください'
  try { 
    new URL(form.gameUrl) 
  } catch { 
    return 'ゲームURLの形式が正しくありません（http:// または https:// から始めてください）' 
  }
  if (!form.platform || form.platform.length === 0) return 'プラットフォームを1つ以上選択してください'
  if (!isEdit && !thumbnailPreview) return 'サムネイル画像を選択してください'
  
  return null
}

export function validateRegisterForm(form) {
  if (!form.username?.trim()) return 'ユーザー名を入力してください'
  if (!form.email?.trim()) return 'メールアドレスを入力してください'
  if (!form.password || form.password.length < 6) return 'パスワードは6文字以上で入力してください'
  return null
}

export function validateLoginForm(form) {
  if (!form.email?.trim()) return 'メールアドレスを入力してください'
  if (!form.password) return 'パスワードを入力してください'
  return null
}
