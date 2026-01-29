import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';

const API_URLS = {
  profiles: func2url['health-profiles'],
  records: func2url['health-records'],
  vaccinations: func2url['health-vaccinations'],
  medications: func2url['health-medications'],
  vitals: func2url['health-vitals'],
  doctors: func2url['health-doctors'],
  insurance: func2url['health-insurance'],
  telemedicine: func2url['health-telemedicine'],
};

function getUserId(): string | null {
  const userId = localStorage.getItem('userId');
  return userId || '1';
}

export function useHealthProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch(API_URLS.profiles, {
          headers: {
            'X-User-Id': userId!,
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
        });

        if (!response.ok) {
          console.error('[useHealthProfiles] Failed to fetch:', response.status, response.statusText);
          throw new Error('Failed to fetch profiles');
        }

        const data = await response.json();
        console.log('[useHealthProfiles] Received profiles:', data);
        setProfiles(data);
      } catch (err) {
        console.error('[useHealthProfiles] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return { profiles, loading, error };
}

export function useHealthRecords(profileId?: string) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const url = profileId
          ? `${API_URLS.records}?profileId=${profileId}`
          : API_URLS.records;

        const response = await fetch(url, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }

        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [profileId]);

  return { records, loading, error };
}

export function useVaccinations(profileId?: string) {
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const url = profileId
          ? `${API_URLS.vaccinations}?profileId=${profileId}`
          : API_URLS.vaccinations;

        const response = await fetch(url, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vaccinations');
        }

        const data = await response.json();
        setVaccinations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, [profileId]);

  return { vaccinations, loading, error };
}

export function useMedications(profileId?: string) {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const url = profileId
          ? `${API_URLS.medications}?profileId=${profileId}`
          : API_URLS.medications;

        const response = await fetch(url, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch medications');
        }

        const data = await response.json();
        setMedications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [profileId]);

  return { medications, loading, error };
}

export function useVitalRecords(profileId?: string) {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const url = profileId
          ? `${API_URLS.vitals}?profileId=${profileId}`
          : API_URLS.vitals;

        const response = await fetch(url, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vitals');
        }

        const data = await response.json();
        setVitals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [profileId]);

  return { vitals, loading, error };
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const response = await fetch(API_URLS.doctors, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }

        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading, error };
}

export function useInsurance(profileId?: string) {
  const [insurance, setInsurance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const url = profileId
          ? `${API_URLS.insurance}?profileId=${profileId}`
          : API_URLS.insurance;

        const response = await fetch(url, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch insurance');
        }

        const data = await response.json();
        setInsurance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInsurance();
  }, [profileId]);

  return { insurance, loading, error };
}

export function useTelemedicine(profileId?: string) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const url = profileId
          ? `${API_URLS.telemedicine}?profileId=${profileId}`
          : API_URLS.telemedicine;

        const response = await fetch(url, {
          headers: {
            'X-User-Id': userId!,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch telemedicine sessions');
        }

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [profileId]);

  return { sessions, loading, error };
}