import React, { useState } from 'react';

/**
 * NISSPY logosu.
 * Kendi logonu kullanmak için proje kökünde public/logo.png ekle (kare, örn. 128×128 px).
 * Dosya yoksa mor kutu içinde "N" harfi gösterilir.
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-14 h-14 text-3xl',
};

const Logo: React.FC<LogoProps> = ({ size = 'sm', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const showFallback = imgError;

  return (
    <div
      className={`rounded-xl flex items-center justify-center text-white font-bold italic bg-indigo-600 overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
      title="NISSPY"
    >
      {!showFallback ? (
        <img
          src="/logo.png"
          alt="NISSPY"
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>N</span>
      )}
    </div>
  );
};

export default Logo;
