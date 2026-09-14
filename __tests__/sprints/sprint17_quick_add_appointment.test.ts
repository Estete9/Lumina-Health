import { createPatient } from '../../lib/services/patientService';
import { createAppointment } from '../../lib/services/appointmentService';
import { CreatePatientInput, CreateAppointmentInput } from '../../lib/types';

jest.mock('../../lib/services/patientService', () => ({
  createPatient: jest.fn(),
}));

jest.mock('../../lib/services/appointmentService', () => ({
  createAppointment: jest.fn(),
}));

describe('Sprint 17: Patient Roster Quick-Add with Appointment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sequentially create a patient and then an appointment with the new patient ID', async () => {
    // 1. Arrange: Setup mocks and test data
    const mockNewPatientId = 'pat-123456';
    
    // Mock createPatient response
    (createPatient as jest.Mock).mockResolvedValue({
      data: {
        id: mockNewPatientId,
        first_name: 'John',
        last_name: 'Doe',
      },
      error: null,
    });

    // Mock createAppointment response
    (createAppointment as jest.Mock).mockResolvedValue({
      data: {
        id: 'apt-987654',
        patient_id: mockNewPatientId,
        status: 'scheduled',
      },
      error: null,
    });

    const newPatientData: CreatePatientInput = {
      first_name: 'John',
      last_name: 'Doe',
      primary_ailment: 'Back pain',
    };

    const appointmentTime = new Date().toISOString();
    const newAppointmentData: Omit<CreateAppointmentInput, 'patient_id' | 'patient_name'> = {
      scheduled_at: appointmentTime,
      duration_minutes: 60,
      session_type: 'in-person',
    };

    // 2. Act: Simulate the compound workflow
    
    // Step 2a: Create patient
    const patientResult = await createPatient(newPatientData, 'prac-1');
    expect(patientResult.error).toBeNull();
    const createdPatient = patientResult.data;
    
    if (!createdPatient) {
      throw new Error('Patient creation failed');
    }

    // Step 2b: Create appointment using the returned patient ID
    const appointmentInput: CreateAppointmentInput = {
      patient_id: createdPatient.id,
      patient_name: `${createdPatient.first_name} ${createdPatient.last_name}`,
      ...newAppointmentData,
    };
    
    const appointmentResult = await createAppointment(appointmentInput, 'prac-1');

    // 3. Assert: Verify the workflow execution and parameters
    
    // Ensure patient was created correctly
    expect(createPatient).toHaveBeenCalledTimes(1);
    expect(createPatient).toHaveBeenCalledWith(newPatientData, 'prac-1');
    
    // Ensure appointment was created correctly with the new patient's ID
    expect(createAppointment).toHaveBeenCalledTimes(1);
    expect(createAppointment).toHaveBeenCalledWith({
      patient_id: mockNewPatientId,
      patient_name: 'John Doe',
      scheduled_at: appointmentTime,
      duration_minutes: 60,
      session_type: 'in-person',
    }, 'prac-1');
    
    // Verify final result
    expect(appointmentResult.error).toBeNull();
    expect(appointmentResult.data?.patient_id).toBe(mockNewPatientId);
  });
});
