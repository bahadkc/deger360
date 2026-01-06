'use client';

import React, { useState, useEffect } from 'react';

const NoSSR = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server'da ve ilk render'da boş döner (HTML eşleşmesi garanti olur)
  if (!mounted) {
    return null; 
    // İstersen buraya <div className="p-10">Yükleniyor...</div> yazabilirsin
    // Ama null dönmek en güvenlisidir.
  }

  return <>{children}</>;
};

export default NoSSR;

