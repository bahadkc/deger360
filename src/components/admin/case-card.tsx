'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CaseData } from './admin-board';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface CaseCardProps {
  caseData: CaseData;
  onDragStart: (caseId: string) => void;
}

// Board stage'e göre section mapping
const getSectionInfo = (boardStage: string) => {
  const stageMap: Record<string, { title: string; emoji: string }> = {
    basvuru_alindi: { title: 'Başvuru Alındı', emoji: '📝' },
    ilk_gorusme: { title: 'İlk Görüşme', emoji: '👋' },
    evrak_ekspertiz: { title: 'Evrak Toplama ve Ekspertiz', emoji: '📋' },
    sigorta_basvurusu: { title: 'Sigorta Başvurusu', emoji: '📮' },
    muzakere: { title: 'Müzakere', emoji: '🤝' },
    odeme: { title: 'Ödeme', emoji: '💰' },
    tamamlandi: { title: 'Tamamlandı', emoji: '✅' },
  };
  return stageMap[boardStage] || { title: 'Başvuru Alındı', emoji: '📝' };
};

export function CaseCard({ caseData, onDragStart }: CaseCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(caseData.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    // Small delay to prevent click event after drag
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent navigation if we just finished dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
  };

  const sectionInfo = getSectionInfo(caseData.board_stage);

  // Check if customer is new (created within last 24 hours) AND in basvuru_alindi stage
  const isNewCustomer = () => {
    if (caseData.board_stage !== 'basvuru_alindi') return false;
    if (!caseData.created_at) return false;
    const createdAt = new Date(caseData.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const isNew = isNewCustomer();

  return (
    <Link href={`/admin/musteriler/${caseData.id}`} onClick={handleLinkClick}>
      <Card
        className={`p-3 cursor-pointer hover:shadow-md transition-all bg-white border ${
          isNew ? 'border-orange-300 border-2' : 'border-neutral-200'
        } hover:border-primary-blue relative`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isNew && (
          <div className="absolute top-2 right-2">
            <div className="bg-orange-500 rounded-full p-1.5 shadow-lg animate-pulse">
              <Bell className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {/* Current Section */}
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
            <span className="text-sm">{sectionInfo.emoji}</span>
            <span className="text-xs font-semibold text-primary-blue">{sectionInfo.title}</span>
          </div>

          {/* Customer Name */}
          <div className="flex items-center gap-2">
            <span className="text-base">👤</span>
            <span className="text-sm font-semibold text-neutral-800">{caseData.customer.full_name}</span>
          </div>

          {/* Vehicle Plate */}
          <div className="flex items-center gap-2">
            <span className="text-base">🚗</span>
            <span className="text-sm text-neutral-600">{caseData.vehicle_plate}</span>
          </div>

          {/* Value Loss Amount */}
          {caseData.value_loss_amount && (
            <div className="flex items-center gap-2">
              <span className="text-base">💸</span>
              <span className="text-sm font-medium text-primary-blue">
                {caseData.value_loss_amount.toLocaleString('tr-TR')} TL
              </span>
            </div>
          )}

          {/* Assigned Lawyer */}
          {caseData.assigned_lawyer && (
            <div className="flex items-center gap-2">
              <span className="text-base">⚖️</span>
              <span className="text-xs text-neutral-600">{caseData.assigned_lawyer}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
