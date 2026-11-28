import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, MenuItem, TextField } from '@mui/material'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import { getUsers } from './mockUsers.js'

export default function UserDirectory() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return getUsers().filter((u) => {
      const matchesStatus = status === 'all' || u.status === status
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [query, status])

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">USER ADMINISTRATION</span>
          <h4>Users</h4>
          <p>Manage staff accounts, roles and account status.</p>
        </div>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1RoundedIcon />}
          onClick={() => navigate('/users/new')}
        >
          Add user
        </Button>
      </div>

      <div className="toolbar">
        <div className="search-form">
          <SearchRoundedIcon />
          <input
            type="search"
            placeholder="Search by name, email, role or department"
            aria-label="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="status-filter"
        >
          <MenuItem value="all">All statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
        <span className="result-count">
          {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
        </span>
      </div>

      <div className="table-paper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <PeopleAltRoundedIcon />
            </div>
            <h6>No users found</h6>
            <p>Try a different search term or status filter.</p>
            <Button
              onClick={() => {
                setQuery('')
                setStatus('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>DEPARTMENT</th>
                  <th>STATUS</th>
                  <th className="row-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </td>
                    <td>{u.role}</td>
                    <td>{u.department}</td>
                    <td>
                      <span className={`status-pill ${u.status}`}>{u.status}</span>
                    </td>
                    <td className="row-actions">
                      <button type="button" onClick={() => navigate(`/users/${u.id}/edit`)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}