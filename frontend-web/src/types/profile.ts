export interface Profile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  photo?: string;
  departmentId?: string;
  departmentName?: string;
  service?: string;
}

export const emptyProfile: Profile = {
  fullName: '',
  email: '',
  phone: '',
  role: '',
  photo: undefined,
  departmentId: '',
  departmentName: '',
  service: ''
};