export function generateUsers(count = 100) {
  const departments = ['Engineering', 'Design', 'Finance', 'Support', 'Research']
  const tiers = ['Gold', 'Silver', 'Bronze']
  const users = []

  for (let id = 1; id <= count; id++) {
    users.push({
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      department: departments[id % departments.length],
      tier: tiers[id % tiers.length]
    })
  }

  return users
}
