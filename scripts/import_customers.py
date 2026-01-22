#!/usr/bin/env python3
"""
CSV dosyasından müşteri ve dava verilerini Supabase'e yükler
"""
import csv
import json
from typing import List, Dict, Any

def parse_csv(filename: str) -> List[Dict[str, Any]]:
    """CSV dosyasını parse eder"""
    customers = []
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Telefon numarasını düzelt (başına 0 ekle)
            phone = row.get('phone', '').strip()
            if phone and not phone.startswith('0'):
                phone = '0' + phone
            
            customer = {
                'full_name': row.get('full_name', '').strip(),
                'email': row.get('email', '').strip(),
                'phone': phone if phone else None,
                'address': row.get('address', '').strip() or None,
                'tc_kimlik': row.get('tc_kimlik', '').strip() or None,
                'dosya_takip_numarasi': row.get('dosya_takip_numarasi', '').strip() or None,
                'iban': row.get('iban', '').strip() or None,
                'payment_person_name': row.get('payment_person_name', '').strip() or None,
                'insurance_company': row.get('insurance_company', '').strip() or None,
                'case': {
                    'case_number': row.get('case_number', '').strip(),
                    'vehicle_plate': row.get('vehicle_plate', '').strip(),
                    'vehicle_brand_model': row.get('vehicle_brand_model', '').strip(),
                    'accident_date': row.get('accident_date', '').strip(),
                    'accident_location': row.get('accident_location', '').strip() or None,
                    'damage_amount': float(row.get('damage_amount', 0)) if row.get('damage_amount') else None,
                    'value_loss_amount': float(row.get('value_loss_amount', 0)) if row.get('value_loss_amount') else None,
                    'fault_rate': int(row.get('fault_rate', 0)) if row.get('fault_rate') else 0,
                    'estimated_compensation': float(row.get('estimated_compensation', 0)) if row.get('estimated_compensation') else None,
                    'commission_rate': int(row.get('commission_rate', 20)) if row.get('commission_rate') else 20,
                    'current_stage': row.get('current_stage', 'başvuru').strip(),
                    'board_stage': row.get('board_stage', 'basvuru_alindi').strip(),
                    'assigned_lawyer': row.get('assigned_lawyer', '').strip() or None,
                    'status': row.get('status', 'active').strip(),
                    'total_payment_amount': float(row.get('total_payment_amount', 0)) if row.get('total_payment_amount') else None,
                    'notary_and_file_expenses': float(row.get('notary_and_file_expenses', 0)) if row.get('notary_and_file_expenses') else 0,
                    'insurance_response': row.get('insurance_response', '').strip() or None,
                }
            }
            customers.append(customer)
    return customers

if __name__ == '__main__':
    customers = parse_csv('../musteri_ornek_format_40_musteri.csv')
    print(f"Toplam {len(customers)} müşteri bulundu")
    print(json.dumps(customers[:2], indent=2, ensure_ascii=False))
