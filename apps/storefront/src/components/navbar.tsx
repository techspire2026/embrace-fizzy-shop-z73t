import { CartDropdown } from "@/components/cart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { Link, useLocation } from "@tanstack/react-router"

export const Navbar = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const baseHref = `/${countryCode}`

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="content-container flex items-center justify-between h-16">

        {/* Logo */}
        <Link
          to="/$countryCode"
          params={{ countryCode }}
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <img
            src="https://www.embracenutrition.in/assets/web/img/logo.png"
            alt="Embrace Nutrition"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-x-8">
          <Link
            to="/$countryCode"
            params={{ countryCode }}
            className="text-sm text-gray-700 hover:text-forest-700 font-medium transition-colors tracking-wide"
          >
            Home
          </Link>
          <a
            href={`${baseHref}/about`}
            className="text-sm text-gray-700 hover:text-forest-700 font-medium transition-colors tracking-wide"
          >
            About
          </a>
          <Link
            to="/$countryCode/store"
            params={{ countryCode }}
            className="text-sm text-gray-700 hover:text-forest-700 font-medium transition-colors tracking-wide"
          >
            Shop
          </Link>
        </div>

        {/* Right: Cart + Sign In */}
        <div className="flex items-center gap-x-4">
          <CartDropdown />

          <a
            href={`${baseHref}/account`}
            className="hidden md:inline-block text-sm text-gray-700 hover:text-forest-700 font-medium transition-colors tracking-wide"
          >
            Sign in
          </a>

          {/* Mobile Hamburger */}
          <Drawer>
            <DrawerTrigger
              className="md:hidden text-gray-700 hover:text-forest-700 transition-colors p-1"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </DrawerTrigger>
            <DrawerContent side="left">
              <DrawerHeader className="border-b border-forest-700 bg-forest-800">
                <DrawerTitle className="flex items-center">
                  <img
                    src="https://www.embracenutrition.in/assets/web/img/logo.png"
                    alt="Embrace Nutrition"
                    className="h-8 w-auto object-contain"
                  />
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col py-4 bg-white flex-1">
                <DrawerClose asChild>
                  <Link
                    to="/$countryCode"
                    params={{ countryCode }}
                    className="px-6 py-4 text-forest-800 text-base font-medium hover:bg-forest-50 hover:text-forest-900 transition-colors"
                  >
                    Home
                  </Link>
                </DrawerClose>
                <DrawerClose asChild>
                  <a
                    href={`${baseHref}/about`}
                    className="px-6 py-4 text-forest-800 text-base font-medium hover:bg-forest-50 hover:text-forest-900 transition-colors"
                  >
                    About
                  </a>
                </DrawerClose>
                <DrawerClose asChild>
                  <Link
                    to="/$countryCode/store"
                    params={{ countryCode }}
                    className="px-6 py-4 text-forest-800 text-base font-medium hover:bg-forest-50 hover:text-forest-900 transition-colors"
                  >
                    Shop
                  </Link>
                </DrawerClose>
                <div className="mx-6 mt-4 border-t border-gray-100 pt-4">
                  <DrawerClose asChild>
                    <a
                      href={`${baseHref}/account`}
                      className="block py-3 text-forest-700 text-sm font-medium hover:text-forest-900 transition-colors"
                    >
                      Sign in
                    </a>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </header>
  )
}

