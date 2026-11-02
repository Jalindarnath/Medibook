import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black">
                Medi<span className="text-blue-500">Book</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Modern, patient-centric healthcare scheduling. Connect with qualified medical specialists and manage your consultations seamlessly.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Healthcare Booking Platform</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <a href="/#services" className="hover:text-white transition">Medical Services</a>
              </li>
              <li>
                <a href="/#about" className="hover:text-white transition">Why MediBook</a>
              </li>
              <li>
                <Link to="/book" className="hover:text-white transition">Book Appointment</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Patient Portal</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Specialties
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>General Consultation</li>
              <li>Dental & Oral Surgery</li>
              <li>Eye Care & Ophthalmology</li>
              <li>Dermatology & Skin Care</li>
              <li>Cardiovascular Health</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Support & Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>+1 (800) 555-MEDIBOOK</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>support@medibook.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Healthcare Plaza, Medical District</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MediBook Healthcare System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built for STQA Engineering Mini Project</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
