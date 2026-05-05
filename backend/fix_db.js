require('mongoose').connect('mongodb+srv://1234:1234@cluster0.lrz3mon.mongodb.net/?appName=Cluster0').then(async () => {
  const Course = require('./src/models/Course');
  const res = await Course.updateMany({ isPublished: { $exists: false } }, { $set: { isPublished: true } });
  console.log('Updated', res);
  process.exit(0);
});
