#!/usr/bin/env ruby

# Cool option parser bro :o

if ARGV[0] == 'start'
  exec 'cd backend && npm start'

elsif ARGV[0] == 'dev'
  exec 'cd backend && npm run dev'

end
