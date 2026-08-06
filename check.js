const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/star-academy').then(() => {
  const MCQ = require('./server/models/MCQ');
  MCQ.aggregate([{ $group: { _id: { subject: '$subject', class: '$class' }, count: { $sum: 1 } } }]).then(res => {
    console.log(res);
    process.exit(0);
  });
});
