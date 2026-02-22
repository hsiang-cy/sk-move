import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import MapBackground from '@/components/inspira/MapBackground'

export default function LoginView() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)
    try {
      await login({ account, password })
      navigate({ to: '/locations' })
    } catch (e) {
      setLoginError(
        e instanceof Error
          ? (e.message === 'Account not found' || e.message === 'Invalid password')
            ? '帳號或密碼錯誤'
            : e.message
          : '登入失敗，請稍後再試',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MapBackground>
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-primary-content" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none tracking-tight">skMove</h1>
                <p className="text-xs text-base-content/40 mt-0.5">路線規劃管理系統</p>
              </div>
            </div>

            <h2 className="font-semibold text-base text-base-content/70 mb-4">登入帳號</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text">帳號</span>
                </label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="請輸入帳號"
                  className="input input-bordered w-full"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text">密碼</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  className="input input-bordered w-full"
                  autoComplete="current-password"
                  required
                />
              </div>

              {loginError && (
                <div className="alert alert-error py-2.5 text-sm">
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block mt-2"
                disabled={isLoading}
              >
                {isLoading && <span className="loading loading-spinner loading-xs" />}
                {isLoading ? '登入中...' : '登入'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MapBackground>
  )
}
