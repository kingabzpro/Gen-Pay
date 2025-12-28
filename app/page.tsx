import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { ArrowRight, Shield, Zap, Globe } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size={32} showText={true} />
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <ThemeToggle />
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Multi-Currency <span className="text-primary">Banking</span> Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage your finances across multiple currencies with virtual debit cards, international transfers, and real-time exchange rates. Fast, secure, and built for the modern world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-secondary bg-transparent"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-secondary">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Why Choose GEN-PAY?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-primary">Multi-Currency Accounts</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Hold and manage balances in USD, EUR, and GBP with real-time exchange rates.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-primary">Virtual Debit Cards</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Generate instant virtual cards for online purchases with spending controls and freeze options.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Globe className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-primary">International Transfers</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Send money globally with competitive exchange rates and transparent fee structure.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Simple, Transparent Pricing
            </h2>
            <Card className="max-w-md mx-auto bg-card border-border">
              <CardHeader>
                <CardTitle className="text-4xl text-primary">Free</CardTitle>
                <CardDescription className="text-muted-foreground">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-foreground">
                    <svg className="h-5 w-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlimited multi-currency accounts
                  </li>
                  <li className="flex items-center text-foreground">
                    <svg className="h-5 w-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Virtual debit cards
                  </li>
                  <li className="flex items-center text-foreground">
                    <svg className="h-5 w-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Real-time exchange rates
                  </li>
                  <li className="flex items-center text-foreground">
                    <svg className="h-5 w-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Instant transfers
                  </li>
                </ul>
                <Link href="/register" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4 bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 GEN-PAY. Built with Next.js, Supabase, and modern web technologies.</p>
        </div>
      </footer>
    </div>
  )
}
