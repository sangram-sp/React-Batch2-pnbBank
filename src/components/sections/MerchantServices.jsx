import React from 'react';
import { CreditCard, QrCode, ShieldCheck, Building2 } from 'lucide-react';
import '../../App.css';

const MerchantServices = () => {
  const items = [
    { icon: <CreditCard />, title: "POS Solutions", desc: "Accept card payments seamlessly" },
    { icon: <QrCode />, title: "QR Payments", desc: "Quick and contactless transactions" },
    { icon: <ShieldCheck />, title: "Secure Gateway", desc: "Protected payment processing" },
    { icon: <Building2 />, title: "Business Banking", desc: "Tailored financial solutions" },
  ];

  return (
    <section className="merchant-services">
      <h2>Merchant Services</h2>
      <div className="services-grid">
        {items.map((item, idx) => (
          <div key={idx} className="card">
            <div className="icon-box">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MerchantServices;