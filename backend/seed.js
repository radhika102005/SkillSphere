// Optional demo data:  npm run seed   (or: node seed.js)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');

const people = [
  {
    name: 'Aarav Sharma', email: 'aarav@demo.com', university: 'IIT Indore', major: 'Computer Science', year: '3rd',
    bio: 'Full-stack dev who loves teaching React and Node.', role: 'both',
    skillsOffered: [{ name: 'React', level: 'Advanced' }, { name: 'Node.js', level: 'Intermediate' }],
    skillsWanted: ['UI Design', 'Public Speaking'],
  },
  {
    name: 'Meera Patel', email: 'meera@demo.com', university: 'NID Ahmedabad', major: 'Design', year: '4th',
    bio: 'Product designer. Happy to swap Figma tips for coding help.', role: 'mentor',
    skillsOffered: [{ name: 'UI Design', level: 'Expert' }, { name: 'Figma', level: 'Expert' }],
    skillsWanted: ['React', 'JavaScript'],
  },
  {
    name: 'Rohan Verma', email: 'rohan@demo.com', university: 'DAVV Indore', major: 'Data Science', year: '2nd',
    bio: 'Python and ML enthusiast.', role: 'both',
    skillsOffered: [{ name: 'Python', level: 'Advanced' }, { name: 'Machine Learning', level: 'Intermediate' }],
    skillsWanted: ['Public Speaking', 'Node.js'],
  },
  {
    name: 'Sneha Iyer', email: 'sneha@demo.com', university: 'IIM Indore', major: 'Management', year: '1st',
    bio: 'Debate champion; coaching communication skills.', role: 'mentor',
    skillsOffered: [{ name: 'Public Speaking', level: 'Expert' }, { name: 'Content Writing', level: 'Advanced' }],
    skillsWanted: ['Python', 'Data Analysis'],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({ email: /@demo\.com$/ })]);

  const users = [];
  for (const p of people) users.push(await User.create({ ...p, password: 'password123' }));

  await Resource.deleteMany({ author: { $in: users.map((u) => u._id) } });
  await Resource.insertMany([
    { title: 'React Official Tutorial', description: 'Learn React by building a tic-tac-toe game.', url: 'https://react.dev/learn', category: 'Web Development', type: 'course', author: users[0]._id },
    { title: 'Figma for Beginners', description: 'Frames, auto-layout and components in one hour.', url: 'https://www.figma.com/resources/learn-design/', category: 'Design', type: 'video', author: users[1]._id },
    { title: 'Python Data Science Handbook', description: 'Free online book covering NumPy, Pandas and scikit-learn.', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', category: 'Data Science', type: 'article', author: users[2]._id },
  ]);

  console.log('Seeded 4 demo users (password: password123) and 3 resources.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
