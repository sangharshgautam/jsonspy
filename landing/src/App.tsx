import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  FileCode,
  ShieldCheck,
  Layers,
  Github,
  Terminal,
  Monitor,
  Cpu,
  Globe,
  Sun,
  Moon,
  ShoppingBag,
} from 'lucide-react';
import {
  JSONSPY_WEB_URL,
  JSONSPY_GITHUB_URL,
  JSONSPY_RELEASES_URL,
  JSONSPY_MS_STORE_URL,
  JSONSPY_SUPPORT_EMAIL,
  JSONSPY_VSCODE_URL,
  JSONSPY_DOWNLOAD_WINDOWS_MSI,
  JSONSPY_DOWNLOAD_LINUX_DEB,
  JSONSPY_DOWNLOAD_MACOS_DMG,
  JSONSPY_DOWNLOAD_INTELLIJ_ZIP,
} from './constants/links';
import { PrivacyModal } from './components/PrivacyModal';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('jsonspy_landing_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('jsonspy_landing_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-brand-500 px-3 py-1.5 rounded-xl text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
              <span className="font-black tracking-tight text-base font-sans">JSONSpy</span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-800 pl-3 hidden sm:inline-block">
              Enterprise Workbench
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-700 dark:text-slate-300 font-medium">
            <a href="#features" className="hover:text-sky-600 dark:hover:text-sky-400 transition">Features</a>
            <a href="#downloads" className="hover:text-sky-600 dark:hover:text-sky-400 transition">Downloads</a>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 text-xs font-medium transition"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-1.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-1.5 text-indigo-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <a
              href={JSONSPY_GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>

            <a
              href={JSONSPY_WEB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition"
            >
              Launch Web App
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/60 dark:from-sky-900/20 via-slate-50/0 dark:via-slate-950/0 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-400 text-xs font-mono mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>v1.0.2 Enterprise Release Now Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Enterprise JSON & Schema <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-brand-500 dark:from-sky-400 dark:to-brand-400">Workbench</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            The ultimate Altova XMLSpy alternative for Web, VS Code, Tauri Desktop, and IntelliJ Platform IDEs. Built with Monaco Editor, SmartFix syntax recovery, Ajv/NetworkNT schema validation, and Visual React Flow designer.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={JSONSPY_WEB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition transform hover:-translate-y-0.5"
            >
              <Globe className="w-4 h-4 mr-2" />
              Launch Web Workbench
            </a>
            <a
              href="#downloads"
              className="flex items-center px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition"
            >
              <Download className="w-4 h-4 mr-2 text-sky-600 dark:text-sky-400" />
              Download Desktop & Plugins
            </a>
          </div>
        </div>
      </section>

      {/* Platform Download Matrix */}
      <section id="downloads" className="py-20 px-6 border-t border-slate-200 dark:border-slate-900 bg-slate-100/60 dark:bg-slate-950/60 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Multi-Platform Ecosystem</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Download JSONSpy for your favorite operating system, editor, or IDE.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Web */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-sky-500/50 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 group-hover:scale-110 transition">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Web SPA</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Instant zero-install access directly in any modern browser.</p>
              </div>
              <a
                href={JSONSPY_WEB_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs text-center shadow-md transition"
              >
                Launch Web App
              </a>
            </div>

            {/* VS Code Extension */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-sky-500/50 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 group-hover:scale-110 transition">
                  <FileCode className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">VS Code</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Enterprise JSON & Schema extension for Visual Studio Code.</p>
              </div>
              <a
                href={JSONSPY_VSCODE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs text-center shadow-md transition"
              >
                Install from Marketplace
              </a>
            </div>

            {/* IntelliJ Plugin */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-purple-500/50 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">IntelliJ Plugin</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">For IntelliJ IDEA, Android Studio, WebStorm, and PyCharm.</p>
              </div>
              <a
                href={JSONSPY_DOWNLOAD_INTELLIJ_ZIP}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center border border-slate-300 dark:border-slate-700 transition"
              >
                Download Plugin .zip
              </a>
            </div>

            {/* Windows */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-500/50 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Windows</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Native Microsoft Store App or Tauri v2 installer (.msi).</p>
              </div>
              <div className="space-y-2">
                <a
                  href={JSONSPY_MS_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-md transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  Microsoft Store
                </a>
                <a
                  href={JSONSPY_DOWNLOAD_WINDOWS_MSI}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px] text-center border border-slate-300 dark:border-slate-700 transition"
                >
                  Direct .msi / .exe
                </a>
              </div>
            </div>

            {/* Linux */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-amber-500/50 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Linux</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Debian package (.deb) and AppImage for Ubuntu/Linux.</p>
              </div>
              <a
                href={JSONSPY_DOWNLOAD_LINUX_DEB}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center border border-slate-300 dark:border-slate-700 transition"
              >
                Download for Linux
              </a>
            </div>

            {/* macOS */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-emerald-500/50 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">macOS</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Native macOS disk image (.dmg) for Apple Silicon & Intel.</p>
              </div>
              <a
                href={JSONSPY_DOWNLOAD_MACOS_DMG}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center border border-slate-300 dark:border-slate-700 transition"
              >
                Download for macOS
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-200 dark:border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Enterprise Capabilities</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Everything you need for advanced JSON data modeling and validation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <FileCode className="w-8 h-8 text-sky-600 dark:text-sky-400 mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Monaco Editor & SmartFix</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Industry-standard Monaco JSON editor with syntax highlighting, folding, and one-click automatic syntax repair for trailing commas and unquoted keys.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Ajv & NetworkNT Schema Validation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Real-time Draft 2020-12 and Draft-07 JSON Schema validation with inline violation error paths and configurable JVM backend engines.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Visual React Flow Schema Designer</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Interactive node-graph visual designer for inspecting, editing, and inferring robust JSON schema definitions effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-900 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} JSONSpy. Open source under Apache 2.0 / MIT.</div>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition underline font-medium"
            >
              Privacy Policy
            </button>
            <a href={`mailto:${JSONSPY_SUPPORT_EMAIL}`} className="hover:text-slate-900 dark:hover:text-slate-200 transition">Support</a>
            <a href={JSONSPY_GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-slate-200 transition">GitHub</a>
            <a href={JSONSPY_RELEASES_URL} target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-slate-200 transition">Releases</a>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
};
