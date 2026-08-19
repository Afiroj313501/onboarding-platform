import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import Login from './Login'
import Register from './Register'

const roles = [
  {
    name: 'Employee',
    description: 'Track your onboarding tasks, access company documents, and share feedback as you settle in.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'Manager',
    description: "See your team's onboarding progress, approve completed tasks, and read feedback from new hires.",
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop&q=80',
  },
  {
    name: 'HR Admin',
    description: 'Manage employee records, build onboarding plans, upload documents, and track company-wide progress.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop&q=80',
  },
]

const features = [
  {
    number: '01',
    title: 'Structured task tracking',
    description: 'Every onboarding step is a task with a status and priority, so nothing falls through the cracks.',
  },
  {
    number: '02',
    title: 'One place for documents',
    description: 'Handbooks, policies, and forms live where new hires actually look for them.',
  },
  {
    number: '03',
    title: 'Feedback that reaches managers',
    description: 'Short, ratable feedback from employees flows directly to the people who can act on it.',
  },
]

const checklistItems = [
  { label: 'Sign employment contract', done: true },
  { label: 'Set up workstation access', done: true },
  { label: 'Complete compliance training', done: false },
  { label: 'Meet your onboarding buddy', done: false },
]

function Landing() {
  const [loaded, setLoaded] = useState(false)
  const [activeModal, setActiveModal] = useState<'login' | 'register' | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      {/* Top bar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <span className="text-lg font-semibold text-ink tracking-tight">
            Onboarding
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal('login')}
              className="text-sm font-medium text-body hover:text-ink transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => setActiveModal('register')}
              className="text-sm font-medium bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-md transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero with photo */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #bbf7d0 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translate(20%, -30%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-8 pt-20 pb-0 grid grid-cols-[1fr_1fr] gap-12 items-center">
          {/* Left: text */}
          <div
            className={`transition-all duration-700 ease-out ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-brand mb-4">
              Onboarding, done properly
            </p>
            <h1 className="text-5xl font-semibold text-ink tracking-tight leading-[1.1]">
              Every new hire's first weeks, tracked in one place.
            </h1>
            <p className="text-body mt-5 text-base leading-relaxed max-w-md">
              Tasks, documents, and feedback for employees, managers, and HR —
              structured so nothing gets lost between a welcome email and a
              first day that actually works.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setActiveModal('register')}
                className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-3 rounded-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Create an account
              </button>
              <button
                onClick={() => setActiveModal('login')}
                className="border border-border hover:border-brand-border hover:bg-surface text-ink text-sm font-medium px-5 py-3 rounded-md transition-colors"
              >
                I already have one
              </button>
            </div>
          </div>

          {/* Right: photo with floating checklist card */}
          <div
            className={`relative transition-all duration-700 delay-150 ease-out ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="rounded-xl overflow-hidden border border-border shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&q=80"
                alt="Team collaborating in a modern office"
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Floating checklist card, overlapping the photo */}
            <div className="absolute -bottom-8 -left-8 w-64 bg-surface border border-border rounded-xl shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-ink">Your onboarding</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-tint text-brand border border-brand-border font-medium">
                  2/4
                </span>
              </div>
              <div className="space-y-2.5">
                {checklistItems.map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 transition-all duration-500 ease-out ${
                      loaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                    }`}
                    style={{ transitionDelay: `${400 + i * 100}ms` }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        item.done ? 'bg-brand border-brand' : 'border-border'
                      }`}
                    >
                      {item.done && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${item.done ? 'text-muted line-through' : 'text-ink'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1.5 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-1000 ease-out"
                  style={{ width: loaded ? '50%' : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to account for floating card overlap */}
        <div className="h-16" />
      </section>

      {/* Role cards with photos */}
      <section className="max-w-5xl mx-auto px-8 pb-20 pt-8">
        <div className="grid grid-cols-3 gap-4">
          {roles.map((role, i) => (
            <div
              key={role.name}
              className={`group bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: loaded ? `${i * 100}ms` : '0ms' }}
            >
              <div className="h-36 overflow-hidden">
                <img
                  src={role.image}
                  alt={role.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>
              <div className="border-l-[3px] border-l-brand p-6">
                <h3 className="font-semibold text-ink group-hover:text-brand transition-colors">
                  {role.name}
                </h3>
                <p className="text-body text-sm mt-2 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-8 py-20">
          <h2 className="text-xl font-semibold text-ink mb-10">
            What's inside
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title}>
                <span className="text-xs font-medium text-brand tracking-wide">
                  {feature.number}
                </span>
                <h3 className="font-medium text-ink text-sm mt-2">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer with background photo */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=500&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, var(--color-bg) 0%, transparent 20%, transparent 80%, var(--color-bg) 100%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-8 py-24 text-center">
          <h2 className="text-2xl font-semibold text-ink">
            Ready to set up your team?
          </h2>
          <p className="text-muted text-sm mt-2">
            Takes a couple of minutes to create your first account.
          </p>
          <button
            onClick={() => setActiveModal('register')}
            className="inline-block mt-6 bg-brand hover:bg-brand-hover text-white text-sm font-medium px-6 py-3 rounded-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Get started
          </button>
        </div>
      </section>

      {/* Auth modals */}
      <Modal isOpen={activeModal === 'login'} onClose={() => setActiveModal(null)}>
        <Login
          onSuccess={() => setActiveModal(null)}
          onSwitchToRegister={() => setActiveModal('register')}
        />
      </Modal>

      <Modal isOpen={activeModal === 'register'} onClose={() => setActiveModal(null)}>
        <Register
          onSuccess={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal('login')}
        />
      </Modal>
    </div>
  )
}

export default Landing