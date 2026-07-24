export function LoginForm() {
  return (
    <form className="space-y-5">
      <div>
        <label className="mb-2 block font-medium">Username</label>

        <input className="w-full rounded-lg border p-3" type="text" />
      </div>

      <div>
        <label className="mb-2 block font-medium">Password</label>

        <input className="w-full rounded-lg border p-3" type="password" />
      </div>

      <button
        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
        type="submit"
      >
        Login
      </button>
    </form>
  );
}
