export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20 py-6">
      <div className="max-w-6xl mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} AI Knowledge Hub. All rights reserved.</p>
        <div className="mt-2 flex gap-4 justify-center">
          <a href="/about" className="hover:text-white">About</a>
          <a href="/contact" className="hover:text-white">Contact</a>
          <a href="/privacy" className="hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  );
}