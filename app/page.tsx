export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to the App</h1>
      <p className="text-lg text-gray-600 mb-6">Please login or register to continue</p>
      <div className="space-x-4">
        <a href="/login" className="px-4 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-700 transition">
          Login
        </a>
        <a href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition">
          Register
        </a>
      </div>
    </main>
  );
}
