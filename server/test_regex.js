const text = ` A force is 20 N is applied on an elastic spring. If the extension produced in the spring is 10 cm, the spring constant of the spring is:

14 Nm-1}

18 Nm-1

200 Nm-1

200 Nm

The speed of sound in air is 350 ms-1. The frequency of the fundamental note emitted by a tube of length 50 cm open at both end is:

50 Hz

175 Hz

350 Hz

700 Hz`;

const extractUnnumberedMCQs = (rawText) => {
  const allMcqs = [];
  // Split by double newlines or more to get blocks
  const blocks = rawText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  
  let i = 0;
  while (i < blocks.length) {
    const questionText = blocks[i];
    const options = [];
    
    // Look ahead up to 4 blocks for options
    let j = i + 1;
    while (j < blocks.length && j < i + 5) {
      // If the block looks like a new question (e.g., ends in a colon or question mark, or is very long), we might break early
      // But typically options are short.
      options.push(blocks[j]);
      j++;
    }
    
    if (options.length === 4) {
      allMcqs.push({
        questionText: questionText,
        options: options,
      });
      i = j; // skip the options
    } else {
      // Maybe not a perfect 4-option block. Just move forward.
      i++;
    }
  }
  
  return allMcqs;
}

console.log(extractUnnumberedMCQs(text));
