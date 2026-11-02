import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Stethoscope,
  Smile,
  Eye,
  Sparkles,
  HeartPulse,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Users,
  Award
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const services = [
    {
      title: 'General Consultation',
      icon: Stethoscope,
      description: 'Comprehensive physical exams, preventative health advice, and diagnosis of common illnesses.',
      doctor: 'Dr. Anjali Joshi & Dr. Sachin Kulkarni',
      category: 'General Consultation',
      bg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Dental Care',
      icon: Smile,
      description: 'Teeth cleaning, whitening, cavity treatment, and advanced orthodontic and surgical procedures.',
      doctor: 'Dr. Pooja Deshmukh & Dr. Aditya Shinde',
      category: 'Dental Care',
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Eye Care',
      icon: Eye,
      description: 'Digital vision examinations, glaucoma screening, cataract evaluations, and corrective prescriptions.',
      doctor: 'Dr. Sneha Patil & Dr. Rohan Gaikwad',
      category: 'Eye Care',
      bg: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Dermatology',
      icon: Sparkles,
      description: 'Clinical skin therapy, acne treatments, allergy management, and cosmetic dermatology.',
      doctor: 'Dr. Neha Sawant & Dr. Amit Jadhav',
      category: 'Dermatology',
      bg: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Cardiology',
      icon: HeartPulse,
      description: 'Heart disease diagnosis, hypertension care, ECG analysis, and holistic cardiovascular health.',
      doctor: 'Dr. Milind Kadam & Dr. Tanvi More',
      category: 'Cardiology',
      bg: 'bg-rose-50 text-rose-600',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Choose Specialty & Doctor',
      desc: 'Select from our verified clinical departments and choose the doctor matching your needs.',
      icon: Stethoscope,
    },
    {
      num: '02',
      title: 'Select Available Time Slot',
      desc: 'Pick your preferred date and view live real-time available time slots without double booking.',
      icon: Clock,
    },
    {
      num: '03',
      title: 'Get Instant Confirmation',
      desc: 'Receive your unique appointment ID immediately and manage your visit from your dashboard.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide uppercase">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Trusted Healthcare Booking System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Your Health, <br />
                Your Time, <br />
                <span className="text-blue-600">Your Appointment.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-xl font-normal leading-relaxed">
                Book healthcare appointments easily and manage your visits with MediBook. Streamlined scheduling with verified specialists.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? "/book" : "/register"}
                  id="hero-book-button"
                  data-testid="hero-book-button"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href="#services"
                  id="hero-services-button"
                  data-testid="hero-services-button"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
                >
                  <span>Explore Services</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap gap-8 items-center text-slate-600 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Real-time Slot Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero Double-Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Easy Cancellation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6 relative z-10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Instant Clinic Booking</h4>
                      <p className="text-xs text-slate-500">Live Doctor Availability</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Slots Open
                  </span>
                </div>

                {/* Simulated Appointment Preview Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Confirmed Booking</span>
                      <h5 className="font-semibold text-slate-900 text-sm">Dr. Milind Kadam (Cardiologist)</h5>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      MB-10101
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tomorrow</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>10:00 AM</span>
                    </div>
                  </div>
                </div>

                {/* Key stats row */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 bg-blue-50/50 rounded-lg">
                    <div className="text-xl font-extrabold text-blue-700">5+</div>
                    <div className="text-[11px] text-slate-500 font-medium">Departments</div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-lg">
                    <div className="text-xl font-extrabold text-emerald-700">10+</div>
                    <div className="text-[11px] text-slate-500 font-medium">Top Doctors</div>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-lg">
                    <div className="text-xl font-extrabold text-purple-700">24/7</div>
                    <div className="text-[11px] text-slate-500 font-medium">Booking Access</div>
                  </div>
                </div>
              </div>

              {/* Decorative background blurs */}
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-blue-600 font-semibold text-xs tracking-wider uppercase">Simple & Seamless</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              How MediBook Works
            </h2>
            <p className="text-slate-600 text-base">
              Book your healthcare appointment in three straightforward steps with zero waiting room hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 relative hover:shadow-md transition-all text-left space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Available Services Section */}
      <section id="services" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-blue-600 font-semibold text-xs tracking-wider uppercase">Clinical Excellence</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Available Medical Services
            </h2>
            <p className="text-slate-600 text-base">
              Explore specialized medical departments and book your consultation directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left space-y-5"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.bg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                      <p className="text-xs text-blue-600 font-medium mt-1">{service.doctor}</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <Link
                    to={isAuthenticated ? `/book?category=${encodeURIComponent(service.category)}` : `/login`}
                    className="inline-flex items-center justify-between w-full pt-4 border-t border-slate-100 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>Book {service.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose MediBook Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-blue-600 font-semibold text-xs tracking-wider uppercase">Our Commitment</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Why Healthcare Providers & Patients Rely on MediBook
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                MediBook was engineered to eliminate appointment confusion, double-booking errors, and long clinic wait times. Powered by real-time database slot synchronization.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">Backend Slot Lock Protection</h4>
                    <p className="text-slate-500 text-sm">Once a slot is reserved, our backend database prevents concurrent conflicts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">Instant Unique Appointment IDs</h4>
                    <p className="text-slate-500 text-sm">Every consultation is tagged with an immutable unique tracking code.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">Admin Clinic Management</h4>
                    <p className="text-slate-500 text-sm">Dedicated administrative portal to verify, approve, and oversee appointments.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-left">
                <Users className="w-8 h-8 text-blue-600" />
                <h4 className="text-2xl font-bold text-slate-900">100%</h4>
                <p className="text-xs text-slate-600 font-medium">Verified Physicians & Specialists</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-left">
                <Clock className="w-8 h-8 text-emerald-600" />
                <h4 className="text-2xl font-bold text-slate-900">&lt; 1 min</h4>
                <p className="text-xs text-slate-600 font-medium">Average Booking Completion Time</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-left">
                <Shield className="w-8 h-8 text-purple-600" />
                <h4 className="text-2xl font-bold text-slate-900">Secure</h4>
                <p className="text-xs text-slate-600 font-medium">Encrypted Authentication & Session</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-left">
                <Calendar className="w-8 h-8 text-amber-600" />
                <h4 className="text-2xl font-bold text-slate-900">Real-time</h4>
                <p className="text-xs text-slate-600 font-medium">Instant Slot Availability Engine</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-blue-600 font-semibold text-xs tracking-wider uppercase">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Contact MediBook Support
            </h2>
            <p className="text-slate-600 text-base">
              Have questions regarding your clinic visit or scheduling? Our patient support team is available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Call Us</h3>
              <p className="text-slate-600 text-sm">+1 (800) 555-MEDIBOOK</p>
              <p className="text-xs text-slate-400">Monday - Friday: 8am - 8pm</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Email Inquiries</h3>
              <p className="text-slate-600 text-sm">support@medibook.com</p>
              <p className="text-xs text-slate-400">Response within 2 hours</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Central Clinic</h3>
              <p className="text-slate-600 text-sm">Healthcare Plaza, Medical District</p>
              <p className="text-xs text-slate-400">Suite 400, North Wing</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
