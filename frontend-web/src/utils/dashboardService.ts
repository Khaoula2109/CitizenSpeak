import axios from 'axios';

export async function fetchDashboardStats(token: string) {
  return axios.get('http://localhost:8080/api/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
