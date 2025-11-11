
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: "Maintenance" | "Development" | "Social" | "Performance";
  role: string;
  joiningDate: string;
  experience: number;
  skills: string[];
  utilization: number;
  ctc?: number;
  projects: string[];
  avatar: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

const fetchEmployees = async () => {
  if (!user) return;

  try {
    setLoading(true);
    setError(null);

    // Static demo employees
    const formattedEmployees: Employee[] = [
      {
        id: 'e-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@agency.com',
        phone: '+91 98765 43210',
        department: 'Development',
        role: 'Frontend Developer',
        joiningDate: '2023-06-12',
        experience: 3,
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        utilization: 72,
        ctc: 850000,
        projects: ['Website Redesign', 'Mobile App'],
        avatar: 'AS'
      },
      {
        id: 'e-2',
        name: 'Neha Verma',
        email: 'neha.verma@agency.com',
        phone: '+91 98765 76543',
        department: 'Social',
        role: 'Social Media Manager',
        joiningDate: '2022-02-18',
        experience: 5,
        skills: ['Content Strategy', 'Analytics', 'Canva'],
        utilization: 64,
        ctc: 900000,
        projects: ['Brand Campaign', 'Influencer Outreach'],
        avatar: 'NV'
      },
      {
        id: 'e-3',
        name: 'Rohit Gupta',
        email: 'rohit.gupta@agency.com',
        phone: '+91 99887 77665',
        department: 'Performance',
        role: 'Performance Marketer',
        joiningDate: '2021-11-03',
        experience: 4,
        skills: ['Google Ads', 'Facebook Ads', 'A/B Testing'],
        utilization: 58,
        ctc: 780000,
        projects: ['E-commerce Funnel'],
        avatar: 'RG'
      },
      {
        id: 'e-4',
        name: 'Priya Singh',
        email: 'priya.singh@agency.com',
        phone: '+91 91234 56789',
        department: 'Maintenance',
        role: 'DevOps Engineer',
        joiningDate: '2020-08-24',
        experience: 6,
        skills: ['AWS', 'Docker', 'CI/CD'],
        utilization: 81,
        ctc: 1200000,
        projects: ['Infrastructure Revamp'],
        avatar: 'PS'
      }
    ];

    setEmployees(formattedEmployees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    setError(err instanceof Error ? err.message : 'Failed to fetch employees');
  } finally {
    setLoading(false);
  }
};

const addEmployee = async (employeeData: {
  name?: string;
  email?: string;
  phone?: string;
  department?: "Maintenance" | "Development" | "Social" | "Performance";
  role?: string;
  joiningDate?: string;
  experience?: number;
  skills: string[];
  ctc?: number;
}) => {
  try {
    // Validate required fields
    if (!employeeData.name || !employeeData.email || !employeeData.phone || 
        !employeeData.department || !employeeData.role || !employeeData.joiningDate ||
        employeeData.experience === undefined || !employeeData.ctc) {
      return { success: false, error: 'All fields are required' };
    }

    const employeeId = crypto.randomUUID();

    const newEmployee: Employee = {
      id: employeeId,
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      department: employeeData.department,
      role: employeeData.role,
      joiningDate: employeeData.joiningDate,
      experience: employeeData.experience ?? 0,
      skills: employeeData.skills,
      utilization: 0,
      ctc: employeeData.ctc,
      projects: [],
      avatar: employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    } as Employee;

    setEmployees(prev => [...prev, newEmployee]);

    return { success: true };
  } catch (err) {
    console.error('Error adding employee:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add employee' };
  }
};

const editEmployee = async (employeeId: string, employeeData: {
  name: string;
  email: string;
  phone: string;
  department: "Maintenance" | "Development" | "Social" | "Performance";
  role: string;
  joiningDate: string;
  experience: number;
  skills: string;
  ctc: number;
}) => {
  try {
    const skillsArray = employeeData.skills.split(',').map(s => s.trim()).filter(Boolean);

    setEmployees(prev => prev.map(emp =>
      emp.id === employeeId
        ? {
            ...emp,
            name: employeeData.name,
            email: employeeData.email,
            phone: employeeData.phone,
            department: employeeData.department,
            role: employeeData.role,
            joiningDate: employeeData.joiningDate,
            experience: employeeData.experience,
            ctc: employeeData.ctc,
            avatar: employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            skills: skillsArray,
          }
        : emp
    ));

    return { success: true };
  } catch (err) {
    console.error('Error editing employee:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update employee' };
  }
};

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [user, isAuthenticated]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    editEmployee,
  };
};
