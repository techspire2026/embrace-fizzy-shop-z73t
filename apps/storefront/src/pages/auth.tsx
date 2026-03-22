import { useState } from "react"
import { useLogin, useRegister } from "@/lib/hooks/use-customer"
import { useNavigate, useParams } from "@tanstack/react-router"

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const { countryCode } = useParams({ strict: false })
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ email, password })
      } else {
        await registerMutation.mutateAsync({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        })
      }
      navigate({ to: "/$countryCode/account", params: { countryCode: countryCode || "de" } })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again."
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center pt-[64px] pb-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://www.embracenutrition.in/assets/web/img/logo.png"
            alt="Embrace Nutrition"
            className="h-10 w-auto object-contain mx-auto mb-6"
          />
          <h1 className="font-display text-3xl font-bold text-forest-900 mb-2">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h1>
          <p className="text-gray-500">
            {isLogin
              ? "Sign in to your Embrace account"
              : "Join Embrace for a healthier you"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-forest-800 mb-2"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-forest-200 rounded-lg focus:outline-none focus:border-forest-600"
                  placeholder="John"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-forest-800 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-forest-200 rounded-lg focus:outline-none focus:border-forest-600"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-forest-800 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-forest-200 rounded-lg focus:outline-none focus:border-forest-600"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-forest-800 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-forest-200 rounded-lg focus:outline-none focus:border-forest-600"
              placeholder="Enter your password"
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending || registerMutation.isPending}
            className="w-full bg-forest-700 text-white py-3 rounded-full hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loginMutation.isPending || registerMutation.isPending
              ? "Processing..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
            }}
            className="text-forest-600 hover:text-forest-900 text-sm font-medium"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
}
