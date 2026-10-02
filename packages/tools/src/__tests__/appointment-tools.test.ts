import { describe, it, expect } from 'vitest';
import { checkAvailabilityTool, bookAppointmentTool } from '../definitions/appointment.tools.js';

describe('Multi-Industry Appointment Tools', () => {
  it('should query availability slots for a medical or wellness service', async () => {
    const result = await checkAvailabilityTool.execute(
      {
        service_type: 'Consulta Odontológica Valoración',
        preferred_date: '2026-10-15',
        preferred_time_range: 'manana',
        staff_or_specialist: 'Dra. Sofía Valenzuela',
      },
      { businessId: 'bus-dental-01', conversationId: 'conv-test-1' }
    );

    expect(result.service).toBe('Consulta Odontológica Valoración');
    expect(result.date).toBe('2026-10-15');
    expect(result.available_slots).toBeDefined();
    expect(result.available_slots.length).toBeGreaterThan(0);
    expect(result.policy_reminder).toContain('24 horas');
  });

  it('should book an appointment and return a confirmation code', async () => {
    const result = await bookAppointmentTool.execute(
      {
        service_type: 'Ortodoncia Control',
        date: '2026-10-15',
        time: '11:30 AM',
        customer_name: 'Carlos Ramírez',
        customer_phone: '+573108889900',
        document_id: '1020304050',
        notes: 'Paciente con brackets estéticos',
      },
      { businessId: 'bus-dental-01', conversationId: 'conv-test-1' }
    );

    expect(result.success).toBe(true);
    expect(result.appointment_id).toMatch(/^APT-\d{6}$/);
    expect(result.status).toBe('confirmed');
    expect(result.customer_name).toBe('Carlos Ramírez');
    expect(result.instructions).toContain('10 minutos antes');
  });
});
