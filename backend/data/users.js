import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User 1',
    email: 'admin1@gmail.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true
  },
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false
  },
  {
    name: 'Ben Stokes',
    email: 'ben@gmail.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false
  },
];

export default users;
