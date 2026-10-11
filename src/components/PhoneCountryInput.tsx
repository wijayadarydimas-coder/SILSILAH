'use client';

import React, { useState, useEffect } from 'react';
import { Phone, ExternalLink } from 'lucide-react';
import { COUNTRY_CODES, formatWhatsAppUrl } from '@/lib/familyLogic';

interface PhoneCountryInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  showWhatsAppPreview?: boolean;
}

export function PhoneCountryInput({
  value,
  onChange,
  placeholder = '81234567890',
  required = false,
  disabled = false,
  label,
  showWhatsAppPreview = true,
}: PhoneCountryInputProps) {
  const [selectedCode, setSelectedCode] = useState('+62');
  const [localNumber, setLocalNumber] = useState('');

  // Parse incoming value into countryCode + localNumber
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }

    const trimmed = value.trim();
    // Check if it starts with any known country code
    let matchedCode = '';
    for (const item of COUNTRY_CODES) {
      if (trimmed.startsWith(item.code)) {
        matchedCode = item.code;
        break;
      }
    }

    if (matchedCode) {
      setSelectedCode(matchedCode);
      setLocalNumber(trimmed.slice(matchedCode.length).replace(/^0+/, ''));
    } else if (trimmed.startsWith('0')) {
      // If it starts with 0 (e.g. 0812...), assume default +62 and strip leading 0
      setSelectedCode('+62');
      setLocalNumber(trimmed.replace(/^0+/, ''));
    } else {
      setLocalNumber(trimmed.replace(/^\+/, ''));
    }
  }, [value]);

  const handleCountryChange = (newCode: string) => {
    setSelectedCode(newCode);
    const cleanNum = localNumber.replace(/^0+/, '').replace(/\D/g, '');
    const combined = cleanNum ? `${newCode}${cleanNum}` : '';
    onChange(combined);
  };

  const handleNumberChange = (rawInput: string) => {
    // Strip leading 0 and keep only numbers
    const cleanNum = rawInput.replace(/^0+/, '').replace(/\D/g, '');
    setLocalNumber(cleanNum);
    const combined = cleanNum ? `${selectedCode}${cleanNum}` : '';
    onChange(combined);
  };

  const waUrl = value ? formatWhatsAppUrl(value) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-secondary, #A79D8D)',
            marginBottom: 2,
            fontWeight: 500,
          }}
        >
          <Phone size={13} color="#C6A15B" />
          <span>{label}</span>
          {required && <span style={{ color: '#D97970' }}>*</span>}
        </label>
      )}

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Country Code Dropdown */}
        <select
          value={selectedCode}
          disabled={disabled}
          onChange={(e) => handleCountryChange(e.target.value)}
          title="Pilih Kode Negara WhatsApp"
          style={{
            width: 130,
            padding: '9px 8px',
            borderRadius: 8,
            background: 'var(--bg-elevated, #211D18)',
            border: '1px solid var(--border-subtle, #393128)',
            color: 'var(--text-primary, #F1E8D8)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            outline: 'none',
          }}
        >
          {COUNTRY_CODES.map((item) => (
            <option key={item.code} value={item.code} style={{ background: '#211D18', color: '#F1E8D8' }}>
              {item.flag} {item.code} ({item.country.split(' ')[0]})
            </option>
          ))}
        </select>

        {/* Local Number Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="tel"
            value={localNumber}
            disabled={disabled}
            required={required}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              background: 'var(--bg-elevated, #211D18)',
              border: '1px solid var(--border-subtle, #393128)',
              color: 'var(--text-primary, #F1E8D8)',
              fontSize: 13,
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        </div>
      </div>

      {/* WhatsApp Direct Link Preview */}
      {showWhatsAppPreview && value && waUrl && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(198, 161, 91, 0.1)',
            border: '1px solid rgba(198, 161, 91, 0.25)',
            borderRadius: 6,
            padding: '4px 8px',
            marginTop: 3,
            fontSize: 11,
            color: '#C6A15B',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C6A15B' }} />
            Tertaut WhatsApp: <strong>{value}</strong>
          </span>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Uji coba tautan WhatsApp"
            style={{
              color: '#F1E8D8',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Tes WA <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}
