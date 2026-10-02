import { z } from 'zod';
import type { ToolDefinition } from '../types/tool.interface.js';

// --- Tool 1: check_availability ---
export const CheckAvailabilitySchema = z.object({
  service_type: z.string().describe('Tipo de servicio, consulta médica, especialidad o tipo de reserva solicitada'),
  preferred_date: z.string().describe('Fecha deseada en formato YYYY-MM-DD o día de la semana (ej: 2026-10-05 o mañana)'),
  preferred_time_range: z.enum(['manana', 'tarde', 'noche', 'cualquiera']).default('cualquiera').describe('Franja horaria preferida'),
  staff_or_specialist: z.string().optional().describe('Nombre del especialista, doctor o consultor si el cliente lo solicita'),
});

export type CheckAvailabilityArgs = z.infer<typeof CheckAvailabilitySchema>;

export const checkAvailabilityTool: ToolDefinition<CheckAvailabilityArgs> = {
  name: 'check_availability',
  description: 'Consulta los cupos y horarios disponibles para citas médicas, estéticas, asesorías profesionales o reservas.',
  schema: CheckAvailabilitySchema,
  category: 'appointment',
  async execute(args, context) {
    const requestedDate = args.preferred_date;
    const slots = [
      { time: '09:00 AM', status: 'available', specialist: args.staff_or_specialist || 'Especialista Disponible' },
      { time: '11:30 AM', status: 'available', specialist: args.staff_or_specialist || 'Especialista Disponible' },
      { time: '03:00 PM', status: 'available', specialist: args.staff_or_specialist || 'Especialista Disponible' },
      { time: '04:30 PM', status: 'available', specialist: args.staff_or_specialist || 'Especialista Disponible' },
    ];

    return {
      service: args.service_type,
      date: requestedDate,
      time_range: args.preferred_time_range,
      available_slots: slots,
      business_id: context?.businessId || 'default-business',
      policy_reminder: 'Las citas deben cancelarse o reagendarse con mínimo 24 horas de anticipación.',
    };
  },
};

// --- Tool 2: book_appointment ---
export const BookAppointmentSchema = z.object({
  service_type: z.string().describe('Servicio o procedimiento a agendar'),
  date: z.string().describe('Fecha confirmada en formato YYYY-MM-DD'),
  time: z.string().describe('Hora confirmada (ej: 11:30 AM o 15:00)'),
  customer_name: z.string().min(2).describe('Nombre completo del cliente o paciente'),
  customer_phone: z.string().min(7).describe('Teléfono o WhatsApp de contacto'),
  document_id: z.string().optional().describe('Cédula o documento de identidad si es requerido por el centro'),
  notes: z.string().optional().describe('Motivo de consulta o notas preparatorias'),
});

export type BookAppointmentArgs = z.infer<typeof BookAppointmentSchema>;

export const bookAppointmentTool: ToolDefinition<BookAppointmentArgs> = {
  name: 'book_appointment',
  description: 'Confirma y registra formalmente una cita, consulta médica o reserva de servicio para el cliente.',
  schema: BookAppointmentSchema,
  category: 'appointment',
  async execute(args, context) {
    const appointmentCode = `APT-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      appointment_id: appointmentCode,
      service: args.service_type,
      date: args.date,
      time: args.time,
      customer_name: args.customer_name,
      customer_phone: args.customer_phone,
      document_id: args.document_id || 'No especificado',
      notes: args.notes || 'Ninguna',
      status: 'confirmed',
      business_id: context?.businessId || 'default-business',
      instructions: 'Por favor llegar 10 minutos antes con su documento de identidad.',
    };
  },
};
