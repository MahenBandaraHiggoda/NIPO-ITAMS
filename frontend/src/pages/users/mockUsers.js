// TEMPORARY in-memory mock store until the backend users API is ready.
// Data lives in browser memory only, so a full page refresh resets it.
export const ROLES = ['Admin', 'IT Officer', 'Store Keeper', 'Staff']
export const DEPARTMENTS = ['IT Division', 'Stores', 'Finance', 'Legal', 'Administration', 'Procurement']

let users = [
  { id: 1, name: 'Nimali Perera', email: 'nimali.perera@nipo.gov.lk', role: 'Admin', department: 'IT Division', status: 'active' },
  { id: 2, name: 'Kasun Fernando', email: 'kasun.fernando@nipo.gov.lk', role: 'IT Officer', department: 'IT Division', status: 'active' },
  { id: 3, name: 'Sanduni Silva', email: 'sanduni.silva@nipo.gov.lk', role: 'Store Keeper', department: 'Stores', status: 'active' },
  { id: 4, name: 'Ruwan Jayasinghe', email: 'ruwan.jayasinghe@nipo.gov.lk', role: 'Staff', department: 'Finance', status: 'inactive' },
  { id: 5, name: 'Dilini Wickramasinghe', email: 'dilini.w@nipo.gov.lk', role: 'Staff', department: 'Legal', status: 'active' },
  { id: 6, name: 'Chamara Bandara', email: 'chamara.bandara@nipo.gov.lk', role: 'IT Officer', department: 'IT Division', status: 'inactive' },
  { id: 7, name: 'Tharushi Gunawardena', email: 'tharushi.g@nipo.gov.lk', role: 'Staff', department: 'Administration', status: 'active' },
  { id: 8, name: 'Pradeep Rathnayake', email: 'pradeep.r@nipo.gov.lk', role: 'Staff', department: 'Procurement', status: 'active' },
]

export const getUsers = () => users

export const getUser = (id) => users.find((u) => String(u.id) === String(id))

export const addUser = (data) => {
  const id = Math.max(0, ...users.map((u) => u.id)) + 1
  users = [...users, { id, ...data }]
  return id
}

export const updateUser = (id, data) => {
  users = users.map((u) => (String(u.id) === String(id) ? { ...u, ...data } : u))
}