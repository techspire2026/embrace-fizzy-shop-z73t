import { CartDropdown } from "@/components/cart"
import { PredictiveSearch } from "@/components/search/predictive-search"
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
import { EllipsisHorizontal } from "@medusajs/icons"
import { useState, useEffect } from "react"

export const Navbar = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const baseHref = `/${countryCode}`
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 40)

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-terracotta-600 text-cream-50 py-2 text-center text-xs tracking-widest uppercase font-medium">
        Free shipping on orders above ₹499 &nbsp;·&nbsp; 100% Natural Ingredients
      </div>

      <div
        className={`fixed top-[36px] inset-x-0 z-40 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "bg-cream-50/95 backdrop-blur-md shadow-sm" : "bg-cream-50"}`}
      >
        <header className="h-16 border-b border-terracotta-100">
          <nav className="content-container flex items-center justify-between w-full h-full">
            {/* Logo */}
            <Link
              to="/$countryCode"
              params={{ countryCode }}
              className="text-2xl font-display font-bold text-bark-900 hover:text-terracotta-600 tracking-tight transition-colors"
            >
              Embrace
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-x-8">
              <Link
                to="/$countryCode/store"
                params={{ countryCode }}
                className="text-sm text-bark-700 hover:text-terracotta-600 font-medium transition-colors tracking-wide"
              >
                Shop All
              </Link>
              <Link
                to="/$countryCode/categories/$handle"
                params={{ countryCode, handle: "probiotic-drinks" }}
                className="text-sm text-bark-700 hover:text-terracotta-600 font-medium transition-colors tracking-wide"
              >
                Flavors
              </Link>
              <a
                href={`${baseHref}/about`}
                className="text-sm text-bark-700 hover:text-terracotta-600 font-medium transition-colors tracking-wide"
              >
                Our Story
              </a>
              <a
                href={`${baseHref}/faq`}
                className="text-sm text-bark-700 hover:text-terracotta-600 font-medium transition-colors tracking-wide"
              >
                FAQ
              </a>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-x-4">
              <PredictiveSearch />
              <CartDropdown />

              {/* Mobile Menu */}
              <Drawer>
                <DrawerTrigger className="lg:hidden text-bark-700 hover:text-terracotta-600 transition-colors">
                  <EllipsisHorizontal className="w-6 h-6" />
                </DrawerTrigger>
                <DrawerContent side="left">
                  <DrawerHeader className="border-b border-terracotta-100">
                    <DrawerTitle className="font-display text-2xl font-bold text-bark-900">Embrace</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col py-6 gap-1">
                    <DrawerClose asChild>
                      <Link
                        to="/$countryCode/store"
                        params={{ countryCode }}
                        className="px-6 py-4 text-bark-800 text-base font-medium hover:bg-terracotta-50 hover:text-terracotta-700 transition-colors"
                      >
                        Shop All
                      </Link>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Link
                        to="/$countryCode/categories/$handle"
                        params={{ countryCode, handle: "probiotic-drinks" }}
                        className="px-6 py-4 text-bark-800 text-base font-medium hover:bg-terracotta-50 hover:text-terracotta-700 transition-colors"
                      >
                        Flavors
                      </Link>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <a
                        href={`${baseHref}/about`}
                        className="px-6 py-4 text-bark-800 text-base font-medium hover:bg-terracotta-50 hover:text-terracotta-700 transition-colors"
                      >
                        Our Story
                      </a>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <a
                        href={`${baseHref}/faq`}
                        className="px-6 py-4 text-bark-800 text-base font-medium hover:bg-terracotta-50 hover:text-terracotta-700 transition-colors"
                      >
                        FAQ
                      </a>
                    </DrawerClose>
                    <div className="mx-6 mt-4 border-t border-terracotta-100 pt-4">
                      <DrawerClose asChild>
                        <a
                          href={`${baseHref}/account`}
                          className="block py-3 text-bark-600 text-sm hover:text-terracotta-600 transition-colors"
                        >
                          My Account
                        </a>
                      </DrawerClose>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </nav>
        </header>
      </div>
    </>
  )
}
