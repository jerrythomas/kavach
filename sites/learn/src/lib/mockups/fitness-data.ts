export type Role = 'athlete' | 'coach' | 'admin'

export interface Athlete {
  id: string
  name: string
  role: 'athlete'
  plan: string
  coachId: string
  progress: { completed: number; total: number; streak: number }
  todayWorkout: { name: string; exercises: string[]; duration: string }
}

export interface Coach {
  id: string
  name: string
  role: 'coach'
  specialty: string
  athleteIds: string[]
}

export interface Admin {
  id: string
  name: string
  role: 'admin'
}

export type FitUser = Athlete | Coach | Admin

export const ATHLETES: Athlete[] = [
  {
    id: 'u1', name: 'Alex Rivera', role: 'athlete', plan: 'Strength 12-Week', coachId: 'c1',
    progress: { completed: 14, total: 36, streak: 5 },
    todayWorkout: { name: 'Upper Body Power', exercises: ['Bench Press 4×6', 'Pull-ups 4×8', 'OHP 3×10'], duration: '45 min' }
  },
  {
    id: 'u2', name: 'Sam Park', role: 'athlete', plan: 'HIIT Fundamentals', coachId: 'c1',
    progress: { completed: 8, total: 24, streak: 3 },
    todayWorkout: { name: 'Tabata Cardio', exercises: ['Burpees 20s', 'Jump Rope 20s', 'Mountain Climbers 20s'], duration: '30 min' }
  },
  {
    id: 'u3', name: 'Jordan Wu', role: 'athlete', plan: 'Mobility & Recovery', coachId: 'c2',
    progress: { completed: 21, total: 28, streak: 9 },
    todayWorkout: { name: 'Hip & Shoulder Flow', exercises: ['Hip 90/90 3×45s', 'Thoracic Rotation 3×10', 'Scapular CARs 2×10'], duration: '20 min' }
  }
]

export const COACHES: Coach[] = [
  { id: 'c1', name: 'Coach Maya', role: 'coach', specialty: 'Strength & HIIT', athleteIds: ['u1', 'u2'] },
  { id: 'c2', name: 'Coach Raj', role: 'coach', specialty: 'Mobility & Recovery', athleteIds: ['u3'] }
]

export const ADMIN: Admin = { id: 'a1', name: 'Admin', role: 'admin' }

export const ALL_USERS: FitUser[] = [...ATHLETES, ...COACHES, ADMIN]

export const GYM_MEMBERS = [
  { id: 'm1', name: 'Taylor Chen', membership: 'Premium', trainer: 'Coach Maya', checkins: 42, status: 'active' },
  { id: 'm2', name: 'Morgan Lee', membership: 'Basic', trainer: 'Coach Raj', checkins: 18, status: 'active' },
  { id: 'm3', name: 'Casey Brown', membership: 'Premium', trainer: 'Coach Maya', checkins: 67, status: 'active' },
  { id: 'm4', name: 'Riley Kim', membership: 'Basic', trainer: null, checkins: 5, status: 'inactive' }
]

export const BLOCKED_ROUTES: Record<Role, string[]> = {
  athlete: ['/coach', '/admin'],
  coach: ['/admin'],
  admin: []
}

export const HACKER_LOG = [
  { ts: '09:14:02', method: 'GET', path: '/coach/athletes', role: 'athlete', rule: 'role:coach', action: 'redirect:/auth' },
  { ts: '09:14:05', method: 'GET', path: '/admin/users', role: 'athlete', rule: 'role:admin', action: 'redirect:/dashboard' },
  { ts: '09:14:09', method: 'GET', path: '/api/admin-stats', role: 'athlete', rule: 'role:admin', action: 'reject:403' }
]
