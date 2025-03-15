import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches a list of doctors from Supabase
 * @param limit Optional limit for the number of doctors to fetch
 * @param offset Optional offset for pagination
 * @returns Promise with the doctors data and any error
 */
export async function fetchDoctors(limit?: number, offset?: number) {
  // First, fetch doctors without any joins
  let doctorQuery = supabase.from('doctor').select('*');
  
  // Apply pagination if provided
  if (limit !== undefined) {
    doctorQuery = doctorQuery.limit(limit);
  }
  
  if (offset !== undefined) {
    doctorQuery = doctorQuery.range(offset, offset + (limit || 10) - 1);
  }
  
  const { data: doctors, error: doctorError } = await doctorQuery;
  
  if (doctorError || !doctors || doctors.length === 0) {
    return { doctors: doctors, users: null, error: doctorError };
  }
  
  // Extract all user_ids from the doctors
  const userIds = doctors
    .map(doctor => doctor.user_id)
    .filter(Boolean);
  
    const specializationIds = doctors
    .map(doctor => doctor.specialization_id)
    .filter(Boolean);
  console.log(specializationIds)
  if (userIds.length === 0) {
    return { doctors: doctors, users: null, error: null };
  }
  
  // Fetch the corresponding users
  const { data: users, error: userError } = await supabase
    .from('user')
    .select('*')
    .in('supabase_id', userIds);
  
  if (userError) {
    console.error("Error fetching users:", userError);
    return { doctors: doctors, users: null, error: userError };
  }
  const { data: specialization, error: specializationError } = await supabase
  .from('specialization')
  .select('*')
  .in('id', specializationIds);
  // Return both datasets
  return { 
    doctors: doctors, 
    users: users, 
    specialization : specialization,
    error: null 
  };
}

/**
 * Fetches a single doctor by ID
 * @param doctorId The ID of the doctor to fetch
 * @returns Promise with the doctor data and any error
 */
export async function fetchDoctorById(doctorId: string) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('id', doctorId)
    .eq('role', 'doctor')
    .single();
  
  return { data, error };
}

/**
 * Fetches doctors with additional filtering options
 * @param options Object containing filter options
 * @returns Promise with the filtered doctors data and any error
 */
export async function fetchDoctorsWithFilters(options: {
  specialty?: string;
  name?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('user')
    .select('*')
    .eq('role', 'doctor');
  
  // Apply filters if provided
  if (options.specialty) {
    query = query.eq('specialty', options.specialty);
  }
  
  if (options.name) {
    query = query.ilike('name', `%${options.name}%`);
  }
  
  if (options.status) {
    query = query.eq('status', options.status);
  }
  
  // Apply pagination
  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }
  
  if (options.offset !== undefined) {
    query = query.range(
      options.offset, 
      options.offset + (options.limit || 10) - 1
    );
  }
  
  const { data, error } = await query;
  
  return { data, error };
} 