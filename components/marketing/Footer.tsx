'use client';

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 py-16 text-sm">
      <div className="grid gap-8 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500" />
            <span className="text-base font-semibold">Tayog School Suite</span>
          </div>
          <p className="text-muted-foreground">Unified platform for school operations and insights. Our mission is to empower schools with delightful, data-driven tools.</p>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <a href="#" className="hover:text-foreground">Twitter</a>
            <a href="#" className="hover:text-foreground">LinkedIn</a>
            <a href="#" className="hover:text-foreground">Facebook</a>
            <a href="#" className="hover:text-foreground">YouTube</a>
          </div>
        </div>
        <div>
          <div className="mb-3 font-medium">Product</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#screens" className="hover:text-foreground">Screens</a></li>
            <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-medium">Resources</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="/home" className="hover:text-foreground">Monitoring Dashboard</a></li>
            <li><a href="#" className="hover:text-foreground">Docs</a></li>
            <li><a href="#" className="hover:text-foreground">Support</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-medium">Stay in the loop</div>
          <form className="flex gap-2">
            <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Work email" />
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Subscribe</button>
          </form>
          <div className="mt-4 text-xs text-muted-foreground">By subscribing, you agree to receive product updates and marketing emails.</div>
          <div className="mt-6 text-sm">
            <div>Sales: <a href="mailto:sales@tayog.app" className="underline">sales@tayog.app</a></div>
            <div>Support: <a href="mailto:support@tayog.app" className="underline">support@tayog.app</a></div>
            <div>Phone: +1 (555) 000-1234</div>
            <div>Address: 123 Education Ave, Suite 100, Bengaluru</div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} Tayog School Suite</span>
        <div className="flex items-center gap-4">
          <a className="hover:text-foreground" href="/login">Login</a>
          <a className="hover:text-foreground" href="/signup">Sign up</a>
        </div>
      </div>
    </footer>
  );
}


