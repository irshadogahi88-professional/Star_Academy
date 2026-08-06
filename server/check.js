const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/star_educational_academy').then(async () => {
  const MCQ = require('./models/MCQ');
  MCQ.aggregate([{ $group: { _id: { subject: '$subject', class: '$class' }, count: { $sum: 1 } } }]).then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  });
});
