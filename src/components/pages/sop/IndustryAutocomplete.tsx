"use client";
import { useState, useEffect, useRef } from "react";

const INDUSTRY_LIST = [
  "Professional Services",
  "Business Process Outsourcing (BPO)",
  "Knowledge Process Outsourcing (KPO)",
  "Human Resource Services",
  "Staffing & Recruitment",
  "Call Center Services",
  "Accounting & Bookkeeping",
  "Audit & Tax Services",
  "Company Secretarial Services",

  "Software Development",
  "Software as a Service (SaaS)",
  "Mobile App Development",
  "Web Development",
  "Artificial Intelligence",
  "Data Analytics",
  "Cyber Security",
  "Cloud Computing",
  "Blockchain",
  "Gaming & Esports",

  "FinTech",
  "NBFC",
  "Microfinance",
  "Investment Advisory",
  "Venture Capital",
  "Private Equity",
  "Wealth Management",
  "Stock Broking",
  "Mutual Funds",
  "Payment Aggregator",
  "Hospitals & Clinics",

  "Diagnostics & Pathology",
  "Medical Devices",
  "Health Technology",
  "Telemedicine",
  "Wellness & Fitness",
  "Pharmaceutical Distribution",

  "FMCG Manufacturing",
  "Food Processing",
  "Plastic Manufacturing",
  "Steel Manufacturing",
  "Electrical Equipment Manufacturing",
  "Machinery Manufacturing",
  "Packaging Industry",

  "Import & Export",
  "Wholesale Trading",
  "Distributor",
  "Dealer & Retailer",
  "Commodity Trading",

  "Power Generation",
  "Solar Energy",
  "Wind Energy",
  "Infrastructure Development",
  "Roads & Highways",
  "Water Management",
  "Cosmatic Industry",
  "Construction & Infrastructure",
  "Manufacturing",
  "Automotive Industry",
  "Textile Industry",
  "Education & Training",
  "Healthcare & Medical Services",
  "Banking & Financial Services",
  "Insurance & Risk Management",
  "Legal Services",
  "Marketing & Advertising",
  "Media & Publishing",
  "Real Estate Development",
  "Renewable Energy",
  "Telecommunications",
  "Transportation & Logistics",
  "Utilities & Energy",
  "Waste Management",

  "Coaching & Training",
  "Skill Development",
  "Online Education",
  "EdTech Platforms",
  "Vocational Training",

  "Retail & E-commerce",
  "Hospitality & Food Services",
  "Construction & Real Estate",
  "Consulting",
  "Logistics & Transportation",
  "Media & Entertainment",
  "Non-Profit / NGO",
];

interface IndustryAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function IndustryAutocomplete({
  value,
  onChange,
}: IndustryAutocompleteProps) {
  const [input, setInput] = useState<string>(value || "");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        setFiltered([]);
        setShowDropdown(false);
        return;
      }
      if (input.trim() === "") {
        setFiltered([]);
        setShowDropdown(false);
        return;
      }
      const match = INDUSTRY_LIST.filter((item) =>
        item.toLowerCase().includes(input.toLowerCase()),
      );
      setFiltered(match);
      setShowDropdown(match.length > 0);
    }, 300);
    return () => clearTimeout(handler);
  }, [input]);

  return (
    <>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="eg: manufacturing, consulting"
          className="w-full p-3 border border-purple-500 rounded-lg  text-purple-100 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Dropdown in a portal-like position - outside the input container */}
      {showDropdown && filtered.length > 0 && (
        <ul
          className="relative -mt-1 bg-slate-800 border border-purple-500/30 rounded-lg max-h-40 overflow-y-auto shadow-lg"
          style={{ zIndex: 9999 }}
        >
          {filtered.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                justSelectedRef.current = true;
                onChange(item);
                setInput(item);
                setFiltered([]);
                setShowDropdown(false);
              }}
              className="p-3 cursor-pointer hover:bg-purple-600/40 text-purple-100 transition-colors"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
